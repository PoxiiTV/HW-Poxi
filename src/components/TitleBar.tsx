import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../store";

function buildRaw(s: ReturnType<typeof useStore.getState>["settings"]) {
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

export function TitleBar() {
  const mode           = useStore((s) => s.mode);
  const setMode        = useStore((s) => s.setMode);
  const setSettingsOpen = useStore((s) => s.setSettingsOpen);
  const settings       = useStore((s) => s.settings);
  const setSettings    = useStore((s) => s.setSettings);

  const win = getCurrentWindow();

  const toggleMode = async () => {
    const next = mode === "full" ? "mini" : "full";
    await invoke("set_window_mode", { mode: next });
    setMode(next);
  };

  const togglePin = async () => {
    const next = { ...settings, alwaysOnTop: !settings.alwaysOnTop };
    await invoke("set_always_on_top", { enabled: next.alwaysOnTop });
    setSettings({ alwaysOnTop: next.alwaysOnTop });
    await invoke("save_settings", { settings: buildRaw(next) });
  };

  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-between px-3 h-9 shrink-0 glass-strong border-b border-[var(--color-border)]"
    >
      <div
        className="flex items-center gap-2 pointer-events-none select-none"
        data-tauri-drag-region
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#g1)" />
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="url(#g2)" strokeWidth="1.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="g1" x1="2" y1="2" x2="22" y2="12" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--color-accent)" /><stop offset="1" stopColor="var(--color-accent-2)" />
            </linearGradient>
            <linearGradient id="g2" x1="2" y1="12" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--color-accent)" /><stop offset="1" stopColor="var(--color-accent-2)" />
            </linearGradient>
          </defs>
        </svg>
        <span className="text-[11px] font-semibold tracking-widest text-gradient uppercase">
          HW Poxi
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={togglePin}
          title={settings.alwaysOnTop ? "Desactivar siempre encima" : "Siempre encima"}
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${
            settings.alwaysOnTop
              ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
              : "text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          📌
        </button>

        <button
          onClick={toggleMode}
          title={mode === "full" ? "Modo mini" : "Modo completo"}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          {mode === "full" ? "⊟" : "⊞"}
        </button>

        {mode === "full" && (
          <button
            onClick={() => setSettingsOpen(true)}
            title="Ajustes"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            ⚙
          </button>
        )}

        <div className="w-px h-4 bg-[var(--color-border)] mx-1" />

        <button
          onClick={() => win.minimize()}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          ─
        </button>
        <button
          onClick={() => win.hide()}
          title="Minimizar a bandeja"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-[var(--color-text-dim)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
