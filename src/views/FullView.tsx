import { useStore } from "../store";
import { CpuCard } from "./CpuCard";
import { GpuCard } from "./GpuCard";
import { TempChart } from "../components/TempChart";

function RamBar() {
  const memory = useStore((s) => s.snapshot?.memory);
  if (!memory || (memory.usedGb == null && memory.totalGb == null)) return null;

  const pct = memory.usedGb != null && memory.totalGb != null
    ? Math.min(100, (memory.usedGb / memory.totalGb) * 100)
    : null;

  return (
    <div className="glass rounded-[var(--radius-card)] px-5 py-3 flex items-center gap-4">
      <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-dim)] font-semibold shrink-0 w-8">RAM</span>
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-[var(--color-text)] tabular-nums">
            {memory.usedGb != null ? memory.usedGb.toFixed(1) : "—"} GB
            {memory.totalGb != null && (
              <span className="text-xs text-[var(--color-text-dim)] font-normal">
                {" "}/ {memory.totalGb.toFixed(1)} GB
              </span>
            )}
          </span>
          {memory.loadPercent != null && (
            <span className="text-xs text-[var(--color-text-muted)] tabular-nums">
              {memory.loadPercent.toFixed(1)} %
            </span>
          )}
        </div>
        {pct != null && (
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--color-surface-active)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-2))",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function FullView() {
  const sidecarError = useStore((s) => s.sidecarError);
  const history      = useStore((s) => s.history);

  const cpuTemps = history.map((p) => p.cpuTemp);
  const gpuTemps = history.map((p) => p.gpuTemp);

  return (
    <div className="p-4 h-full overflow-y-auto flex flex-col gap-3">
      {sidecarError && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3 text-xs text-[var(--color-danger)] flex flex-col gap-1">
          <span className="font-semibold">⚠ Error al iniciar el lector de sensores</span>
          <span className="text-[var(--color-text-muted)] font-mono break-all">{sidecarError}</span>
          <span className="text-[var(--color-text-dim)] mt-1">
            Ejecuta la app <strong>como Administrador</strong> para acceso completo a los sensores.
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <CpuCard />
        <GpuCard />
      </div>

      {/* Gráfica de historial */}
      {(cpuTemps.length > 1 || gpuTemps.length > 1) && (
        <div className="glass rounded-[var(--radius-card)] px-5 pt-3 pb-4">
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-dim)] font-semibold mb-2">
            Temperatura — últimos {history.length}s
          </p>
          <TempChart cpuTemps={cpuTemps} gpuTemps={gpuTemps} />
        </div>
      )}

      {/* RAM */}
      <RamBar />
    </div>
  );
}
