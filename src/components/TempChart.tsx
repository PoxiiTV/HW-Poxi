interface Props {
  cpuTemps: (number | null)[];
  gpuTemps: (number | null)[];
  minTemp?: number;
  maxTemp?: number;
}

const W = 100;  // viewBox width (%)
const H = 56;   // viewBox height px

function toPolyline(data: (number | null)[], lo: number, hi: number): string {
  const range = hi - lo || 1;
  const segments: string[][] = [];
  let seg: string[] = [];

  data.forEach((v, i) => {
    const x = (i / (data.length - 1)) * W;
    if (v == null) {
      if (seg.length) { segments.push(seg); seg = []; }
    } else {
      const y = H - ((Math.min(Math.max(v, lo), hi) - lo) / range) * H;
      seg.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
  });
  if (seg.length) segments.push(seg);

  return segments.map(s => s.join(" ")).join(" M ");
}

export function TempChart({ cpuTemps, gpuTemps, minTemp = 0, maxTemp = 110 }: Props) {
  const hasData = cpuTemps.some(v => v != null) || gpuTemps.some(v => v != null);

  const allVals = [...cpuTemps, ...gpuTemps].filter((v): v is number => v != null);
  const lo = allVals.length ? Math.max(minTemp, Math.floor(Math.min(...allVals) / 10) * 10 - 10) : minTemp;
  const hi = allVals.length ? Math.min(maxTemp, Math.ceil(Math.max(...allVals) / 10) * 10 + 10) : maxTemp;

  const cpuPath = cpuTemps.length > 1 ? toPolyline(cpuTemps, lo, hi) : "";
  const gpuPath = gpuTemps.length > 1 ? toPolyline(gpuTemps, lo, hi) : "";

  return (
    <div className="relative w-full" style={{ height: `${H + 20}px` }}>
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-5 flex flex-col justify-between pointer-events-none">
        <span className="text-[9px] text-[var(--color-text-dim)] leading-none">{hi}°</span>
        <span className="text-[9px] text-[var(--color-text-dim)] leading-none">{lo}°</span>
      </div>

      <div className="absolute left-6 right-0 top-0 bottom-5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(f => (
            <line
              key={f}
              x1={0} y1={H * f} x2={W} y2={H * f}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-[var(--color-border)]"
              strokeDasharray="2 3"
            />
          ))}

          {/* CPU line */}
          {cpuPath && (
            <polyline
              points={cpuPath}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          )}

          {/* GPU line */}
          {gpuPath && (
            <polyline
              points={gpuPath}
              fill="none"
              stroke="var(--color-accent-2)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          )}

          {!hasData && (
            <text
              x={W / 2} y={H / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="6"
              fill="var(--color-text-dim)"
            >
              Recopilando datos…
            </text>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="absolute bottom-0 left-6 flex gap-4">
        <div className="flex items-center gap-1">
          <div className="w-4 h-0.5 rounded" style={{ background: "var(--color-accent)" }} />
          <span className="text-[9px] text-[var(--color-text-dim)]">CPU</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-0.5 rounded" style={{ background: "var(--color-accent-2)" }} />
          <span className="text-[9px] text-[var(--color-text-dim)]">GPU</span>
        </div>
        <span className="text-[9px] text-[var(--color-text-dim)] ml-2">
          últimos {cpuTemps.length}s
        </span>
      </div>
    </div>
  );
}
