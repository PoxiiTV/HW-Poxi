using LibreHardwareMonitor.Hardware;
using System.Text.RegularExpressions;

namespace HwSidecar;

public sealed class HardwareReader : IDisposable
{
    private readonly Computer _computer;
    private bool _dumped;

    public HardwareReader()
    {
        _computer = new Computer
        {
            IsCpuEnabled    = true,
            IsGpuEnabled    = true,
            IsMemoryEnabled = true,
        };
        _computer.Open();
    }

    public HwSnapshot Read()
    {
        foreach (var hw in _computer.Hardware)
        {
            hw.Update();
            foreach (var sub in hw.SubHardware) sub.Update();
        }

        CpuData?    cpu    = null;
        GpuData?    gpu    = null;
        MemoryData? memory = null;

        foreach (var hw in _computer.Hardware)
        {
            switch (hw.HardwareType)
            {
                case HardwareType.Cpu when cpu == null:
                    cpu = ReadCpu(hw); break;
                case HardwareType.GpuNvidia or HardwareType.GpuAmd or HardwareType.GpuIntel when gpu == null:
                    gpu = ReadGpu(hw); break;
                case HardwareType.Memory when memory == null:
                    memory = ReadMemory(hw); break;
            }
        }

        return new HwSnapshot(cpu, gpu, memory);
    }

    // ── CPU ─────────────────────────────────────────────────────────────────
    private CpuData ReadCpu(IHardware hw)
    {
        SensorValue? pkgTemp  = null;
        SensorValue? pkgPower = null;
        var coreTemps  = new Dictionary<int, ISensor>();
        var coreClocks = new Dictionary<int, ISensor>();
        var coreVolts  = new Dictionary<int, ISensor>();

        ProcessCpuSensors(hw.Sensors, ref pkgTemp, ref pkgPower, coreTemps, coreClocks, coreVolts);
        foreach (var sub in hw.SubHardware)
            ProcessCpuSensors(sub.Sensors, ref pkgTemp, ref pkgPower, coreTemps, coreClocks, coreVolts);

        if (!_dumped) { _dumped = true; DumpAll(hw); }

        var cores = coreTemps.Keys.Union(coreClocks.Keys).Union(coreVolts.Keys)
            .OrderBy(x => x)
            .Select(id => new CpuCore(
                id,
                coreTemps .TryGetValue(id, out var t) ? ToValue(t) : null,
                coreClocks.TryGetValue(id, out var c) ? ToValue(c) : null,
                coreVolts .TryGetValue(id, out var v) ? ToValue(v) : null))
            .ToList();

        return new CpuData(hw.Name, pkgTemp, pkgPower, cores);
    }

    private static void ProcessCpuSensors(
        IEnumerable<ISensor> sensors,
        ref SensorValue? pkgTemp, ref SensorValue? pkgPower,
        Dictionary<int, ISensor> coreTemps,
        Dictionary<int, ISensor> coreClocks,
        Dictionary<int, ISensor> coreVolts)
    {
        foreach (var s in sensors)
        {
            var name = s.Name;
            switch (s.SensorType)
            {
                case SensorType.Temperature:
                    if (pkgTemp == null && IsPackageTemp(name)) pkgTemp = ToValue(s);
                    else if (IsCoreIndexed(name))               TryAddIndexed(coreTemps, s);
                    break;
                case SensorType.Power:
                    if (pkgPower == null && IsPackagePower(name)) pkgPower = ToValue(s);
                    break;
                case SensorType.Clock:
                    if (IsCoreIndexed(name)) TryAddIndexed(coreClocks, s);
                    break;
                case SensorType.Voltage:
                    if (IsCoreIndexed(name)) TryAddIndexed(coreVolts, s);
                    break;
            }
        }
    }

    // ── GPU ─────────────────────────────────────────────────────────────────
    private static GpuData ReadGpu(IHardware hw)
    {
        SensorValue? temp      = null;
        SensorValue? coreClock = null;
        SensorValue? memClock  = null;
        SensorValue? voltage   = null;
        SensorValue? power     = null;
        SensorValue? load      = null;
        SensorValue? fanRpm    = null;
        float? vramUsed  = null;
        float? vramTotal = null;

        foreach (var s in hw.Sensors)
        {
            var name = s.Name;
            switch (s.SensorType)
            {
                case SensorType.Temperature when temp == null:
                    temp = ToValue(s); break;
                case SensorType.Clock when name.Contains("Core",   StringComparison.OrdinalIgnoreCase) && coreClock == null:
                    coreClock = ToValue(s); break;
                case SensorType.Clock when name.Contains("Memory", StringComparison.OrdinalIgnoreCase) && memClock == null:
                    memClock = ToValue(s); break;
                case SensorType.Voltage when name.Contains("Core", StringComparison.OrdinalIgnoreCase) && voltage == null:
                    voltage = ToValue(s); break;
                case SensorType.Power when power == null:
                    power = ToValue(s); break;
                case SensorType.Load when load == null:
                    load = ToValue(s); break;
                case SensorType.Fan when fanRpm == null:
                    fanRpm = ToValue(s); break;
                case SensorType.SmallData when name.Contains("Used",  StringComparison.OrdinalIgnoreCase) && vramUsed == null:
                    vramUsed = s.Value; break;
                case SensorType.SmallData when name.Contains("Total", StringComparison.OrdinalIgnoreCase) && vramTotal == null:
                    vramTotal = s.Value; break;
            }
        }

        return new GpuData(hw.Name, temp, coreClock, memClock, voltage, power, load, fanRpm, vramUsed, vramTotal);
    }

    // ── Memory ──────────────────────────────────────────────────────────────
    private static MemoryData ReadMemory(IHardware hw)
    {
        float? usedGb      = null;
        float? availableGb = null;
        float? loadPercent = null;

        foreach (var s in hw.Sensors)
        {
            switch (s.SensorType)
            {
                case SensorType.Data when s.Name.Contains("Used",      StringComparison.OrdinalIgnoreCase) && usedGb == null:
                    usedGb = s.Value; break;
                case SensorType.Data when s.Name.Contains("Available", StringComparison.OrdinalIgnoreCase) && availableGb == null:
                    availableGb = s.Value; break;
                case SensorType.Load when loadPercent == null:
                    loadPercent = s.Value; break;
            }
        }

        float? totalGb = usedGb.HasValue && availableGb.HasValue ? usedGb + availableGb : null;
        return new MemoryData(usedGb, totalGb, loadPercent);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────
    private static bool IsPackageTemp(string n) =>
        n.Contains("Package", StringComparison.OrdinalIgnoreCase) ||
        n.Contains("Tdie",    StringComparison.OrdinalIgnoreCase) ||
        n.Contains("Tctl",    StringComparison.OrdinalIgnoreCase);

    private static bool IsPackagePower(string n) =>
        n.Contains("Package", StringComparison.OrdinalIgnoreCase) ||
        n.Equals("CPU", StringComparison.OrdinalIgnoreCase);

    private static bool IsCoreIndexed(string n) =>
        Regex.IsMatch(n, @"Core\s*#\d+", RegexOptions.IgnoreCase);

    private static void TryAddIndexed(Dictionary<int, ISensor> dict, ISensor s)
    {
        var m = Regex.Match(s.Name, @"#(\d+)");
        if (m.Success && int.TryParse(m.Groups[1].Value, out var id))
            dict.TryAdd(id, s);
    }

    private static SensorValue ToValue(ISensor s) => new(s.Value, s.Min, s.Max);

    private static void DumpAll(IHardware hw)
    {
        Console.Error.WriteLine($"=== CPU: {hw.Name} ===");
        foreach (var s in hw.Sensors)
            Console.Error.WriteLine($"  [{s.SensorType}] \"{s.Name}\" = {s.Value}");
        foreach (var sub in hw.SubHardware)
        {
            Console.Error.WriteLine($"  --- SubHW: {sub.Name} ---");
            foreach (var s in sub.Sensors)
                Console.Error.WriteLine($"    [{s.SensorType}] \"{s.Name}\" = {s.Value}");
        }
    }

    public void Dispose() => _computer.Close();
}
