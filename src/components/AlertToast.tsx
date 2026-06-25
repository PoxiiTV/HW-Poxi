import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../store";

const AUTO_DISMISS_MS = 8000;

export function AlertToast() {
  const alert = useStore(s => s.alert);
  const setAlert = useStore(s => s.setAlert);

  useEffect(() => {
    if (!alert) return;
    const t = setTimeout(() => setAlert(null), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [alert, setAlert]);

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          key="alert"
          initial={{ opacity: 0, y: -16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 360, damping: 28 }}
          className="fixed top-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl"
          style={{
            background: "rgb(251 113 133 / 0.18)",
            backdropFilter: "blur(20px) saturate(160%)",
            border: "1px solid rgb(251 113 133 / 0.45)",
            maxWidth: "380px",
            minWidth: "240px",
          }}
        >
          <span className="text-lg select-none">🌡️</span>
          <p className="text-xs text-[var(--color-text)] flex-1 leading-snug font-medium">
            {alert}
          </p>
          <button
            onClick={() => setAlert(null)}
            className="text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-colors text-sm leading-none ml-1"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
