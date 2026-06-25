namespace HwSidecar;

public record SensorValue(float? Value, float? Min, float? Max);

public record CpuCore(
    int Id,
    SensorValue? Temp,
    SensorValue? Clock,
    SensorValue? Voltage
);

public record CpuData(
    string Name,
    SensorValue? PackageTemp,
    SensorValue? PackagePower,
    List<CpuCore> Cores
);

public record GpuData(
    string Name,
    SensorValue? Temp,
    SensorValue? CoreClock,
    SensorValue? MemoryClock,
    SensorValue? Voltage,
    SensorValue? Power,
    float? VramUsedMb,
    float? VramTotalMb
);

public record HwSnapshot(CpuData? Cpu, GpuData? Gpu);
