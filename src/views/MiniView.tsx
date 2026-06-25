import { useStore } from "../store";
import { TempBadge } from "../components/TempBadge";

export function MiniView() {
  const cpu         = useStore((s) => s.snapshot?.cpu);
  const gpu         = useStore((s) => s.snapshot?.gpu);
  const memory      = useStore((s) => s.snapshot?.memory);
  const miniShowRam = useStore((s) => s.settings.miniShowRam);

  const cpuTemp = cpu?.packageTemp?.value ?? null;
  const cpuMax  = cpu?.packageTemp?.max   ?? null;
  const gpuTemp = gpu?.temp?.value        ?? null;
  const gpuMax  = gpu?.temp?.max          ?? null;

  return (
    <div className="flex-1 flex items-center justify-around px-4 gap-3">
      {/* CPU */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-dim)] font-semibold">CPU</span>
        <TempBadge value={cpuTemp} size="lg" />
        <span className="text-[9px] text-[var(--color-text-dim)] flex items-center gap-1">
          MÁX&nbsp;<TempBadge value={cpuMax} size="sm" />
        </span>
      </div>

      <div className="w-px h-12 bg-[var(--color-border)]" />

      {/* GPU */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-dim)] font-semibold">GPU</span>
        <TempBadge value={gpuTemp} size="lg" />
        <span className="text-[9px] text-[var(--color-text-dim)] flex items-center gap-1">
          MÁX&nbsp;<TempBadge value={gpuMax} size="sm" />
        </span>
      </div>

      {/* RAM — opcional */}
      {miniShowRam && (
        <>
          <div className="w-px h-12 bg-[var(--color-border)]" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-dim)] font-semibold">RAM</span>
            <span className="text-base font-bold tabular-nums" style={{ color: "var(--color-accent)" }}>
              {memory?.usedGb != null ? memory.usedGb.toFixed(1) : "—"}
              <span className="text-[10px] font-normal text-[var(--color-text-dim)]"> GB</span>
            </span>
            <span className="text-[9px] text-[var(--color-text-dim)]">
              {memory?.loadPercent != null ? `${memory.loadPercent.toFixed(0)} %` : "—"}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
