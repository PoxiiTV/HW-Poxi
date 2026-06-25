import { CpuCard } from "./CpuCard";
import { GpuCard } from "./GpuCard";

export function FullView() {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="grid grid-cols-2 gap-4 min-h-full">
        <CpuCard />
        <GpuCard />
      </div>
    </div>
  );
}
