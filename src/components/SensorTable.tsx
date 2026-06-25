interface Props {
  children: React.ReactNode;
}

export function SensorTable({ children }: Props) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-[var(--color-border-strong)]">
          <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
            Sensor
          </th>
          <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-dim)] px-3">
            Actual
          </th>
          <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-dim)] px-3">
            Mín
          </th>
          <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent)] px-3">
            Máx
          </th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
