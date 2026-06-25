import type { SensorValue } from "../types";
import { TempBadge } from "./TempBadge";

interface Props {
  label: string;
  value: SensorValue | null | undefined;
  type: "temp" | "mhz" | "voltage" | "watt" | "mb";
}

function fmt(v: number | null | undefined, type: Props["type"]): React.ReactNode {
  if (v === null || v === undefined)
    return <span className="text-[var(--color-text-dim)]">—</span>;
  switch (type) {
    case "mhz": return <span className="tabular-nums">{Math.round(v)} MHz</span>;
    case "voltage": return <span className="tabular-nums">{v.toFixed(3)} V</span>;
    case "watt": return <span className="tabular-nums">{Math.round(v)} W</span>;
    case "mb": return <span className="tabular-nums">{Math.round(v)} MB</span>;
    case "temp": return <TempBadge value={v} />;
  }
}

export function SensorRow({ label, value, type }: Props) {
  return (
    <tr className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)] transition-colors">
      <td className="py-1.5 pr-4 text-[var(--color-text-muted)] text-xs w-full whitespace-nowrap">
        {label}
      </td>
      <td className="py-1.5 px-3 text-right text-xs text-[var(--color-text)] whitespace-nowrap">
        {fmt(value?.value, type)}
      </td>
      <td className="py-1.5 px-3 text-right text-xs text-[var(--color-text-dim)] whitespace-nowrap">
        {fmt(value?.min, type)}
      </td>
      <td className="py-1.5 px-3 text-right text-xs text-[var(--color-accent)] whitespace-nowrap font-medium">
        {fmt(value?.max, type)}
      </td>
    </tr>
  );
}
