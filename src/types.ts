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
  load: SensorValue | null;
  fanRpm: SensorValue | null;
  vramUsedMb: number | null;
  vramTotalMb: number | null;
}

export interface MemoryData {
  usedGb: number | null;
  totalGb: number | null;
  loadPercent: number | null;
}

export interface HwSnapshot {
  cpu: CpuData | null;
  gpu: GpuData | null;
  memory: MemoryData | null;
}

export interface Settings {
  alwaysOnTop: boolean;
  intervalMs: number;
  unit: "C" | "F";
  theme: "blue" | "red" | "green" | "white";
  alertEnabled: boolean;
  alertTempC: number;
  miniShowRam: boolean;
  miniX: number | null;
  miniY: number | null;
}

export interface HistoryPoint {
  cpuTemp: number | null;
  gpuTemp: number | null;
  cpuPower: number | null;
  gpuPower: number | null;
  gpuLoad: number | null;
  ramUsedGb: number | null;
  ts: number;
}

export type WindowMode = "full" | "mini";
