export interface SensorValue {
  value: number | null;
  min: number | null;
  max: number | null;
}

export interface CpuCore {
  id: number;
  temp: SensorValue | null;
  clock: SensorValue | null;
  voltage: SensorValue | null;
}

export interface CpuData {
  name: string;
  packageTemp: SensorValue | null;
  packagePower: SensorValue | null;
  cores: CpuCore[];
}

export interface GpuData {
  name: string;
  temp: SensorValue | null;
  coreClock: SensorValue | null;
  memoryClock: SensorValue | null;
  voltage: SensorValue | null;
  power: SensorValue | null;
  vramUsedMb: number | null;
  vramTotalMb: number | null;
}

export interface HwSnapshot {
  cpu: CpuData | null;
  gpu: GpuData | null;
}

export interface Settings {
  alwaysOnTop: boolean;
  intervalMs: number;
  unit: "C" | "F";
}

export type WindowMode = "full" | "mini";
