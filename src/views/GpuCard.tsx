import { useStore } from "../store";
import { SensorTable } from "../components/SensorTable";
import { SensorRow } from "../components/SensorRow";

export function GpuCard() {
  const gpu = useStore((s) => s.snapshot?.gpu);

  if (!gpu) {
    return (
      <div className="glass rounded-[var(--radius-card)] p-5 flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="text-2xl mb-2 opacity-40">🎮</div>
          <p className="text-[var(--color-text-dim)] text-sm">Esperando datos de GPU…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-[var(--radius-card)] p-5 flex flex-col gap-3">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-dim)] mb-0.5">GPU</p>
        <p
          className="text-sm font-semibold text-[var(--color-text)] leading-tight truncate"
          title={gpu.name}
        >
          {gpu.name}
        </p>
      </div>

      <SensorTable>
        <SensorRow label="Temperatura" value={gpu.temp} type="temp" />
        <SensorRow label="Freq. Core" value={gpu.coreClock} type="mhz" />
        <SensorRow label="Freq. Memoria" value={gpu.memoryClock} type="mhz" />
        <SensorRow label="Voltaje" value={gpu.voltage} type="voltage" />
        <SensorRow label="Potencia" value={gpu.power} type="watt" />
        {(gpu.vramUsedMb !== null || gpu.vramTotalMb !== null) && (
          <tr className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)] transition-colors">
            <td className="py-1.5 pr-4 text-[var(--color-text-muted)] text-xs">VRAM</td>
            <td colSpan={3} className="py-1.5 px-3 text-right text-xs text-[var(--color-text)]">
              {gpu.vramUsedMb !== null && gpu.vramTotalMb !== null
                ? `${Math.round(gpu.vramUsedMb)} / ${Math.round(gpu.vramTotalMb)} MB`
                : gpu.vramTotalMb !== null
                  ? `${Math.round(gpu.vramTotalMb)} MB`
                  : "—"}
            </td>
          </tr>
        )}
      </SensorTable>
    </div>
  );
}
