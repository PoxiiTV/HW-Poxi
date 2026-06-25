import { create } from "zustand";
import type { HwSnapshot, Settings, WindowMode } from "./types";

interface Store {
  snapshot: HwSnapshot | null;
  mode: WindowMode;
  settings: Settings;
  settingsOpen: boolean;
  setSnapshot: (s: HwSnapshot) => void;
  setMode: (m: WindowMode) => void;
  setSettings: (s: Partial<Settings>) => void;
  setSettingsOpen: (open: boolean) => void;
}

export const useStore = create<Store>((set) => ({
  snapshot: null,
  mode: "full",
  settings: { alwaysOnTop: false, intervalMs: 1000, unit: "C" },
  settingsOpen: false,
  setSnapshot: (snapshot) => set({ snapshot }),
  setMode: (mode) => set({ mode }),
  setSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
}));
