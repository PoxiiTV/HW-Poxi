import { useStore } from "../store";
import { CpuCard } from "./CpuCard";
import { GpuCard } from "./GpuCard";

export function FullView() {
  const sidecarError = useStore((s) => s.sidecarError);

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
    </div>
  );
}
