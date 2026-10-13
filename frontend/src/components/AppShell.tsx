import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import Toast from "./Toast";
import { useUiStore } from "../stores/uiStore";

export default function AppShell() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const setOpen = useUiStore((s) => s.setSidebarOpen);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] transition-colors duration-500">
      <Sidebar />
      <div
        className="min-h-screen transition-[padding] duration-300"
        style={{ paddingLeft: undefined }}
      >
        <div className={`${collapsed ? "lg:pl-[84px]" : "lg:pl-[260px]"} min-h-screen`}>
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--ink)]/10 bg-[var(--bg)]/80 px-4 py-3 backdrop-blur-xl">
            <button
              type="button"
              className="rounded-lg p-2 lg:hidden"
              aria-label="Open sidebar"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="hidden items-center gap-3 sm:flex">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Your journey</span>
              <span className="h-1 w-1 rounded-full bg-amber-400" />
              <span className="text-sm text-[var(--ink)]">Move a little. Unlock what comes next.</span>
            </div>
            <ThemeToggle />
          </header>
          <main className="p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      <Toast />
    </div>
  );
}
