import { useState } from "react";
import { useStore } from "../store";
import { SensorTable } from "../components/SensorTable";
import { SensorRow } from "../components/SensorRow";

export function CpuCard() {
  const cpu = useStore((s) => s.snapshot?.cpu);
  const [viewMode, setViewMode] = useState<"package" | "cores">("package");

  if (!cpu) {
    return (
      <div className="glass rounded-[var(--radius-card)] p-5 flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="text-2xl mb-2 opacity-40">🖥️</div>
          <p className="text-[var(--color-text-dim)] text-sm">Esperando datos de CPU…</p>
        </div>
      </div>
    );
  }

  // AMD Ryzen no expone temp por core — ocultar fila si ningún core tiene dato
  const hasCoreTemp = cpu.cores.some((c) => c.temp?.value != null);

  return (
    <div className="glass rounded-[var(--radius-card)] p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-dim)] mb-0.5">CPU</p>
          <p
            className="text-sm font-semibold text-[var(--color-text)] leading-tight truncate"
            title={cpu.name}
          >
            {cpu.name}
          </p>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-[var(--color-border)] shrink-0">
          {(["package", "cores"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`px-2.5 py-1 text-[10px] transition-colors ${
                viewMode === m
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)]"
              }`}
            >
              {m === "package" ? "Paquete" : "Por core"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-y-auto max-h-[340px]">
        <SensorTable>
          {viewMode === "package" ? (
            <>
              <SensorRow label="Temperatura" value={cpu.packageTemp} type="temp" />
              <SensorRow label="Potencia" value={cpu.packagePower} type="watt" />
            </>
          ) : (
            <>
              {cpu.cores.flatMap((core) => [
                ...(hasCoreTemp
                  ? [<SensorRow key={`t${core.id}`} label={`Core #${core.id} — Temp`} value={core.temp} type="temp" />]
                  : []),
                <SensorRow key={`c${core.id}`} label={`Core #${core.id} — Freq`} value={core.clock} type="mhz" />,
                <SensorRow key={`v${core.id}`} label={`Core #${core.id} — Voltaje`} value={core.voltage} type="voltage" />,
              ])}
            </>
          )}
        </SensorTable>
      </div>
    </div>
  );
}
