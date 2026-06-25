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
            IsCpuEnabled = true,
            IsGpuEnabled = true,
        };
        _computer.Open();
    }

    public HwSnapshot Read()
    {
        foreach (var hw in _computer.Hardware)
        {
            hw.Update();
            foreach (var sub in hw.SubHardware)
                sub.Update();
        }

        CpuData? cpu = null;
        GpuData? gpu = null;

        foreach (var hw in _computer.Hardware)
        {
            if (hw.HardwareType == HardwareType.Cpu && cpu == null)
                cpu = ReadCpu(hw);
            else if (hw.HardwareType is HardwareType.GpuNvidia or HardwareType.GpuAmd or HardwareType.GpuIntel && gpu == null)
                gpu = ReadGpu(hw);
        }

        return new HwSnapshot(cpu, gpu);
    }

    private CpuData ReadCpu(IHardware hw)
    {
        SensorValue? pkgTemp = null;
        SensorValue? pkgPower = null;
        var coreTemps = new Dictionary<int, ISensor>();
        var coreClocks = new Dictionary<int, ISensor>();
        var coreVolts = new Dictionary<int, ISensor>();

        // Leer sensores del hardware principal
        ProcessCpuSensors(hw.Sensors, ref pkgTemp, ref pkgPower, coreTemps, coreClocks, coreVolts);

        // AMD Ryzen: las temps por core suelen estar en sub-hardware
        foreach (var sub in hw.SubHardware)
            ProcessCpuSensors(sub.Sensors, ref pkgTemp, ref pkgPower, coreTemps, coreClocks, coreVolts);

        // Diagnóstico: vuelca todos los sensores en el primer ciclo
        if (!_dumped)
        {
            _dumped = true;
            DumpAll(hw);
        }

        var coreIds = coreTemps.Keys
            .Union(coreClocks.Keys)
            .Union(coreVolts.Keys)
            .OrderBy(x => x)
            .ToList();

        var cores = coreIds.Select(id => new CpuCore(
            id,
            coreTemps.TryGetValue(id, out var t) ? ToValue(t) : null,
            coreClocks.TryGetValue(id, out var c) ? ToValue(c) : null,
            coreVolts.TryGetValue(id, out var v) ? ToValue(v) : null
        )).ToList();

        return new CpuData(hw.Name, pkgTemp, pkgPower, cores);
    }

    private static void ProcessCpuSensors(
        IEnumerable<ISensor> sensors,
        ref SensorValue? pkgTemp,
        ref SensorValue? pkgPower,
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
                    if (pkgTemp == null && IsPackageTemp(name))
                        pkgTemp = ToValue(s);
                    else if (IsCoreIndexed(name))
                        TryAddIndexed(coreTemps, s);
                    break;

                case SensorType.Power:
                    if (pkgPower == null && IsPackagePower(name))
                        pkgPower = ToValue(s);
                    break;

                case SensorType.Clock:
                    if (IsCoreIndexed(name))
                        TryAddIndexed(coreClocks, s);
                    break;

                case SensorType.Voltage:
                    if (IsCoreIndexed(name))
                        TryAddIndexed(coreVolts, s);
                    break;
            }
        }
    }

    // "CPU Package", "Package", "Core (Tdie)", "Tdie", "Tctl/Tdie"
    private static bool IsPackageTemp(string name) =>
        name.Contains("Package", StringComparison.OrdinalIgnoreCase) ||
        name.Contains("Tdie",    StringComparison.OrdinalIgnoreCase) ||
        name.Contains("Tctl",    StringComparison.OrdinalIgnoreCase);

    // "Package", "CPU Package", "Core (SVI2 TFN)"
    private static bool IsPackagePower(string name) =>
        name.Contains("Package", StringComparison.OrdinalIgnoreCase) ||
        name.Equals("CPU", StringComparison.OrdinalIgnoreCase);

    // "Core #0", "CPU Core #0", "Core #0 Distance..." — cualquier sensor indexado por core
    private static bool IsCoreIndexed(string name) =>
        Regex.IsMatch(name, @"Core\s*#\d+", RegexOptions.IgnoreCase);

    private static GpuData ReadGpu(IHardware hw)
    {
        SensorValue? temp = null;
        SensorValue? coreClock = null;
        SensorValue? memClock = null;
        SensorValue? voltage = null;
        SensorValue? power = null;
        float? vramUsed = null;
        float? vramTotal = null;

        foreach (var s in hw.Sensors)
        {
            var name = s.Name;
            switch (s.SensorType)
            {
                case SensorType.Temperature when temp == null:
                    temp = ToValue(s); break;
                case SensorType.Clock when name.Contains("Core", StringComparison.OrdinalIgnoreCase) && coreClock == null:
                    coreClock = ToValue(s); break;
                case SensorType.Clock when name.Contains("Memory", StringComparison.OrdinalIgnoreCase) && memClock == null:
                    memClock = ToValue(s); break;
                case SensorType.Voltage when name.Contains("Core", StringComparison.OrdinalIgnoreCase) && voltage == null:
                    voltage = ToValue(s); break;
                case SensorType.Power when power == null:
                    power = ToValue(s); break;
                case SensorType.SmallData when name.Contains("Used", StringComparison.OrdinalIgnoreCase) && vramUsed == null:
                    vramUsed = s.Value; break;
                case SensorType.SmallData when name.Contains("Total", StringComparison.OrdinalIgnoreCase) && vramTotal == null:
                    vramTotal = s.Value; break;
            }
        }

        return new GpuData(hw.Name, temp, coreClock, memClock, voltage, power, vramUsed, vramTotal);
    }

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

    private static void TryAddIndexed(Dictionary<int, ISensor> dict, ISensor s)
    {
        var match = Regex.Match(s.Name, @"#(\d+)");
        if (match.Success && int.TryParse(match.Groups[1].Value, out var id))
            dict.TryAdd(id, s);
    }

    private static SensorValue ToValue(ISensor s) => new(s.Value, s.Min, s.Max);

    public void Dispose() => _computer.Close();
}
