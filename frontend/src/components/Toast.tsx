import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useUiStore } from "../stores/uiStore";

export default function Toast() {
  const toast = useUiStore((s) => s.toast);
  const clearToast = useUiStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(clearToast, 3200);
    return () => window.clearTimeout(id);
  }, [toast, clearToast]);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            className={`pointer-events-auto rounded-xl px-4 py-3 text-sm text-white shadow-lg ${
              toast.type === "warning"
                ? "bg-amber-500"
                : toast.type === "success"
                  ? "bg-primary-600"
                  : "bg-slate-800"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
