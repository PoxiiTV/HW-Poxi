import { useStore } from "../store";

interface Props {
  value: number | null;
  size?: "sm" | "lg";
}

function getTempColor(c: number): string {
  if (c < 60) return "var(--color-temp-cool)";
  if (c < 80) return "var(--color-temp-warm)";
  return "var(--color-temp-hot)";
}

export function TempBadge({ value, size = "sm" }: Props) {
  const unit = useStore((s) => s.settings.unit);

  if (value === null || value === undefined) {
    return <span className="text-[var(--color-text-dim)]">—</span>;
  }

  const display = unit === "F" ? (value * 9 / 5 + 32).toFixed(1) : value.toFixed(1);
  const suffix = unit === "F" ? "°F" : "°C";
  const color = getTempColor(value);

  if (size === "lg") {
    return (
      <span className="text-2xl font-bold tabular-nums" style={{ color }}>
        {display}{suffix}
      </span>
    );
  }

  return (
    <span className="tabular-nums font-medium" style={{ color }}>
      {display}{suffix}
    </span>
  );
}
