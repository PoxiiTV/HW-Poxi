import { useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../store";
import type { HwSnapshot, Settings } from "../types";

interface RawSettings {
  always_on_top: boolean;
  interval_ms: number;
  unit: string;
  theme: string;
  alert_enabled: boolean;
  alert_temp_c: number;
  mini_show_ram: boolean;
  mini_x: number | null;
  mini_y: number | null;
}

const ALERT_COOLDOWN_MS = 30_000;

export function useSensors() {
  const setSnapshot    = useStore((s) => s.setSnapshot);
  const setSettings    = useStore((s) => s.setSettings);
  const setSidecarError = useStore((s) => s.setSidecarError);
  const pushHistory    = useStore((s) => s.pushHistory);
  const setAlert       = useStore((s) => s.setAlert);
  const settings       = useStore((s) => s.settings);
  const settingsRef    = useRef<Settings>(settings);

  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const lastAlertRef = useRef<Record<string, number>>({});

  useEffect(() => {
    invoke<RawSettings>("get_settings")
      .then((saved) => {
        setSettings({
          alwaysOnTop: saved.always_on_top ?? false,
          intervalMs:  saved.interval_ms  ?? 1000,
          unit:        (saved.unit as "C" | "F") ?? "C",
          theme:       (saved.theme as Settings["theme"]) ?? "blue",
          alertEnabled: saved.alert_enabled ?? true,
          alertTempC:   saved.alert_temp_c  ?? 91,
          miniShowRam:  saved.mini_show_ram ?? false,
          miniX: saved.mini_x ?? null,
          miniY: saved.mini_y ?? null,
        });
      })
      .catch(() => {});

    const unlistenData = listen<string>("sensor_data", (event) => {
      try {
        const data = JSON.parse(event.payload) as HwSnapshot;
        setSnapshot(data);

        // Historia
        pushHistory({
          cpuTemp:   data.cpu?.packageTemp?.value  ?? null,
          gpuTemp:   data.gpu?.temp?.value         ?? null,
          cpuPower:  data.cpu?.packagePower?.value ?? null,
          gpuPower:  data.gpu?.power?.value        ?? null,
          gpuLoad:   data.gpu?.load?.value         ?? null,
          ramUsedGb: data.memory?.usedGb           ?? null,
          ts: Date.now(),
        });

        // Alertas de temperatura
        const cfg = settingsRef.current;
        if (cfg.alertEnabled) {
          const now = Date.now();
          const threshold = cfg.alertTempC;

          const cpuTemp = data.cpu?.packageTemp?.value;
          if (cpuTemp != null && cpuTemp >= threshold) {
            const last = lastAlertRef.current["cpu"] ?? 0;
            if (now - last > ALERT_COOLDOWN_MS) {
              lastAlertRef.current["cpu"] = now;
              setAlert(`CPU a ${cpuTemp.toFixed(1)}°C — supera el límite de ${threshold}°C`);
            }
          }

          const gpuTemp = data.gpu?.temp?.value;
          if (gpuTemp != null && gpuTemp >= threshold) {
            const last = lastAlertRef.current["gpu"] ?? 0;
            if (now - last > ALERT_COOLDOWN_MS) {
              lastAlertRef.current["gpu"] = now;
              setAlert(`GPU a ${gpuTemp.toFixed(1)}°C — supera el límite de ${threshold}°C`);
            }
          }
        }
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
