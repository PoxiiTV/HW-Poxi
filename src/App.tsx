import { AnimatePresence, motion } from "framer-motion";
import { TitleBar } from "./components/TitleBar";
import { FullView } from "./views/FullView";
import { MiniView } from "./views/MiniView";
import { SettingsPanel } from "./views/SettingsPanel";
import { useSensors } from "./hooks/useSensors";
import { useStore } from "./store";

export default function App() {
  useSensors();
  const mode = useStore((s) => s.mode);

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden text-[var(--color-text)]">
      {/* Fondo glassmorphism */}
      <div className="absolute inset-0 -z-10 bg-[#0a0c1a]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1100px 600px at 12% -8%, #1c2150 0%, transparent 55%), radial-gradient(900px 700px at 100% 110%, #2a1850 0%, transparent 55%), linear-gradient(160deg, #0a0c1a 0%, #0d1024 100%)",
          }}
        />
        {mode === "full" && (
          <>
            <div
              className="absolute w-[420px] h-[420px] rounded-full blur-[120px] opacity-30"
              style={{
                background: "#5b7cfa",
                top: "-80px",
                left: "20%",
                animation: "float-orb 14s ease-in-out infinite",
              }}
            />
            <div
              className="absolute w-[380px] h-[380px] rounded-full blur-[120px] opacity-25"
              style={{
                background: "#a06bff",
                bottom: "-60px",
                right: "8%",
                animation: "float-orb 18s ease-in-out infinite reverse",
              }}
            />
          </>
        )}
      </div>

      <TitleBar />

      <AnimatePresence mode="wait">
        {mode === "full" ? (
          <motion.div
            key="full"
            className="flex-1 min-h-0 overflow-hidden"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <FullView />
          </motion.div>
        ) : (
          <motion.div
            key="mini"
            className="flex-1 min-h-0 flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <MiniView />
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsPanel />
    </div>
  );
}
