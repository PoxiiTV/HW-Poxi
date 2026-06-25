import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../store";
import type { Settings } from "../types";

const THEMES: { id: Settings["theme"]; label: string; color: string; bg: string }[] = [
  { id: "blue",  label: "Azul",  color: "#6d8bff", bg: "#0a0c1a" },
  { id: "red",   label: "Rojo",  color: "#ff4d6d", bg: "#1a0608" },
  { id: "green", label: "Verde", color: "#00d97e", bg: "#04120c" },
  { id: "white", label: "Blanco", color: "#4f6bff", bg: "#e8ecff" },
];

function buildRaw(s: Settings) {
  return {
    always_on_top: s.alwaysOnTop,
    interval_ms:   s.intervalMs,
    unit:          s.unit,
    theme:         s.theme,
    alert_enabled: s.alertEnabled,
    alert_temp_c:  s.alertTempC,
    mini_show_ram: s.miniShowRam,
    mini_x:        s.miniX,
    mini_y:        s.miniY,
  };
}

export function SettingsPanel() {
  const open        = useStore((s) => s.settingsOpen);
  const setOpen     = useStore((s) => s.setSettingsOpen);
  const settings    = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const history     = useStore((s) => s.history);

  const [csvMsg, setCsvMsg] = useState<string | null>(null);

  const save = async (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(patch);
    await invoke("save_settings", { settings: buildRaw(next) });
    if (patch.alwaysOnTop !== undefined) {
      await invoke("set_always_on_top", { enabled: patch.alwaysOnTop });
    }
  };

  const exportCsv = async () => {
    const headers = "Tiempo,CPU Temp (°C),GPU Temp (°C),CPU Power (W),GPU Power (W),GPU Load (%),RAM Usada (GB)";
    const rows = history.map((p) =>
      [
        new Date(p.ts).toISOString(),
        p.cpuTemp   ?? "",
        p.gpuTemp   ?? "",
        p.cpuPower  ?? "",
        p.gpuPower  ?? "",
        p.gpuLoad   ?? "",
        p.ramUsedGb ?? "",
      ].join(",")
    );
    const csv = [headers, ...rows].join("\n");
    try {
      const path = await invoke<string>("export_csv", { csv });
      const name = path.split("\\").pop() ?? path;
      setCsvMsg(`✓ Guardado: ${name}`);
      setTimeout(() => setCsvMsg(null), 4000);
    } catch {
      setCsvMsg("✗ Error al exportar");
      setTimeout(() => setCsvMsg(null), 3000);
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
            className="absolute bottom-0 left-0 right-0 z-50 glass-strong border-t border-[var(--color-border-strong)] p-5 flex flex-col gap-4 rounded-b-[14px] overflow-y-auto"
            style={{ maxHeight: "85%" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--color-text)]">Ajustes</p>
              <button
                onClick={() => setOpen(false)}
                className="text-[var(--color-text-dim)] hover:text-[var(--color-text)] w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* ── Tema de color ─────────────────────────────── */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">Tema</span>
              <div className="flex gap-2">
                {THEMES.map(({ id, label, color, bg }) => (
                  <button
                    key={id}
                    onClick={() => save({ theme: id })}
                    title={label}
                    className="flex-1 flex flex-col items-center gap-1.5 py-2 rounded-xl transition-all border"
                    style={{
                      background: settings.theme === id ? `${color}22` : "var(--color-surface)",
                      borderColor: settings.theme === id ? color : "var(--color-border)",
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full border-2"
                      style={{ background: bg, borderColor: color }}
                    />
                    <span className="text-[9px] font-semibold" style={{ color: settings.theme === id ? color : "var(--color-text-dim)" }}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Siempre encima ────────────────────────────── */}
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

            {/* ── Actualización ─────────────────────────────── */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">Actualización</span>
              <div className="flex rounded-lg overflow-hidden border border-[var(--color-border)]">
                {[{ label: "0.5s", ms: 500 }, { label: "1s", ms: 1000 }, { label: "2s", ms: 2000 }].map(({ label, ms }) => (
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

            {/* ── Temperatura ───────────────────────────────── */}
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

            {/* ── Alerta de temperatura ─────────────────────── */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">Alerta de temperatura</span>
                <button
                  onClick={() => save({ alertEnabled: !settings.alertEnabled })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    settings.alertEnabled ? "bg-[var(--color-accent)]" : "bg-[var(--color-surface-active)]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                      settings.alertEnabled ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
              {settings.alertEnabled && (
                <div className="flex items-center gap-3 pl-1">
                  <span className="text-xs text-[var(--color-text-dim)]">Límite</span>
                  <input
                    type="number"
                    min={60}
                    max={110}
                    value={settings.alertTempC}
                    onChange={(e) => {
                      const v = Math.min(110, Math.max(60, Number(e.target.value)));
                      save({ alertTempC: v });
                    }}
                    className="w-16 text-center text-sm font-semibold rounded-lg border px-2 py-1 tabular-nums"
                    style={{
                      background: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text)",
                    }}
                  />
                  <span className="text-xs text-[var(--color-text-dim)]">°C</span>
                </div>
              )}
            </div>

            {/* ── RAM en mini ───────────────────────────────── */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-[var(--color-text-muted)]">RAM en modo Mini</span>
                <p className="text-[10px] text-[var(--color-text-dim)]">Muestra RAM usada en el overlay compacto</p>
              </div>
              <button
                onClick={() => save({ miniShowRam: !settings.miniShowRam })}
                className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ml-3 ${
                  settings.miniShowRam ? "bg-[var(--color-accent)]" : "bg-[var(--color-surface-active)]"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                    settings.miniShowRam ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* ── Separador ─────────────────────────────────── */}
            <div className="h-px bg-[var(--color-border)]" />

            {/* ── Reset Min/Máx ─────────────────────────────── */}
            <button
              onClick={async () => {
                await invoke("reset_min_max");
                setOpen(false);
              }}
              className="w-full py-2 rounded-xl text-sm text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] transition-colors"
            >
              Reiniciar Mín / Máx
            </button>

            {/* ── Exportar CSV ──────────────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={exportCsv}
                disabled={history.length === 0}
                className="w-full py-2 rounded-xl text-sm border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  color:       "var(--color-accent)",
                  borderColor: "var(--color-accent-soft)",
                  background:  "var(--color-accent-soft)",
                }}
              >
                Exportar historial CSV {history.length > 0 ? `(${history.length} muestras)` : ""}
              </button>
              {csvMsg && (
                <p className="text-[11px] text-center" style={{ color: csvMsg.startsWith("✓") ? "var(--color-success)" : "var(--color-danger)" }}>
                  {csvMsg}
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
