import { AnimatePresence, motion } from "framer-motion";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../store";

export function SettingsPanel() {
  const open = useStore((s) => s.settingsOpen);
  const setOpen = useStore((s) => s.setSettingsOpen);
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);

  const save = async (patch: Partial<typeof settings>) => {
    const next = { ...settings, ...patch };
    setSettings(patch);
    await invoke("save_settings", {
      settings: {
        always_on_top: next.alwaysOnTop,
        interval_ms: next.intervalMs,
        unit: next.unit,
      },
    });
    if (patch.alwaysOnTop !== undefined) {
      await invoke("set_always_on_top", { enabled: patch.alwaysOnTop });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="absolute inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-50 glass-strong border-t border-[var(--color-border-strong)] p-5 flex flex-col gap-4 rounded-b-[14px]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--color-text)]">Ajustes</p>
              <button
                onClick={() => setOpen(false)}
                className="text-[var(--color-text-dim)] hover:text-[var(--color-text)] w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Siempre encima */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">Siempre encima</span>
              <button
                onClick={() => save({ alwaysOnTop: !settings.alwaysOnTop })}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  settings.alwaysOnTop ? "bg-[var(--color-accent)]" : "bg-[var(--color-surface-active)]"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                    settings.alwaysOnTop ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Intervalo */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">Actualización</span>
              <div className="flex rounded-lg overflow-hidden border border-[var(--color-border)]">
                {[
                  { label: "0.5s", ms: 500 },
                  { label: "1s", ms: 1000 },
                  { label: "2s", ms: 2000 },
                ].map(({ label, ms }) => (
                  <button
                    key={ms}
                    onClick={() => save({ intervalMs: ms })}
                    className={`px-3 py-1.5 text-[11px] transition-colors ${
                      settings.intervalMs === ms
                        ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                        : "text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Unidad */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">Temperatura</span>
              <div className="flex rounded-lg overflow-hidden border border-[var(--color-border)]">
                {(["C", "F"] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => save({ unit: u })}
                    className={`px-4 py-1.5 text-[11px] transition-colors ${
                      settings.unit === u
                        ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                        : "text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)]"
                    }`}
                  >
                    °{u}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={async () => {
                await invoke("reset_min_max");
                setOpen(false);
              }}
              className="w-full py-2 rounded-xl text-sm text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] transition-colors"
            >
              Reiniciar Mín / Máx
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
