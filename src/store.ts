import { create } from "zustand";
import type { HwSnapshot, Settings, WindowMode, HistoryPoint } from "./types";

const MAX_HISTORY = 60;

interface Store {
  snapshot: HwSnapshot | null;
  mode: WindowMode;
  settings: Settings;
  settingsOpen: boolean;
  sidecarError: string | null;
  history: HistoryPoint[];
  alert: string | null;
  setSnapshot: (s: HwSnapshot) => void;
  setMode: (m: WindowMode) => void;
  setSettings: (s: Partial<Settings>) => void;
  setSettingsOpen: (open: boolean) => void;
  setSidecarError: (e: string | null) => void;
  pushHistory: (point: HistoryPoint) => void;
  setAlert: (msg: string | null) => void;
}

const DEFAULT_SETTINGS: Settings = {
  alwaysOnTop: false,
  intervalMs: 1000,
  unit: "C",
  theme: "blue",
  alertEnabled: true,
  alertTempC: 91,
  miniShowRam: false,
  miniX: null,
  miniY: null,
};

export const useStore = create<Store>((set) => ({
  snapshot: null,
  mode: "full",
  settings: DEFAULT_SETTINGS,
  settingsOpen: false,
  sidecarError: null,
  history: [],
  alert: null,
  setSnapshot: (snapshot) => set({ snapshot }),
  setMode: (mode) => set({ mode }),
  setSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setSidecarError: (sidecarError) => set({ sidecarError }),
  pushHistory: (point) =>
    set((state) => ({
      history:
        state.history.length >= MAX_HISTORY
          ? [...state.history.slice(1), point]
          : [...state.history, point],
    })),
  setAlert: (alert) => set({ alert }),
}));
