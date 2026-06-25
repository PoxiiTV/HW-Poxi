import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../store";
import type { HwSnapshot } from "../types";

interface RawSettings {
  always_on_top: boolean;
  interval_ms: number;
  unit: string;
}

export function useSensors() {
  const setSnapshot = useStore((s) => s.setSnapshot);
  const setSettings = useStore((s) => s.setSettings);
  const setSidecarError = useStore((s) => s.setSidecarError);

  useEffect(() => {
    invoke<RawSettings>("get_settings")
      .then((saved) => {
        setSettings({
          alwaysOnTop: saved.always_on_top ?? false,
          intervalMs: saved.interval_ms ?? 1000,
          unit: (saved.unit as "C" | "F") ?? "C",
        });
      })
      .catch(() => {});

    const unlistenData = listen<string>("sensor_data", (event) => {
      try {
        const data = JSON.parse(event.payload) as HwSnapshot;
        setSnapshot(data);
      } catch { /* JSON malformado */ }
    });

    const unlistenError = listen<string>("sidecar_error", (event) => {
      setSidecarError(event.payload);
    });

    return () => {
      unlistenData.then((fn) => fn());
      unlistenError.then((fn) => fn());
    };
  }, []);
}
