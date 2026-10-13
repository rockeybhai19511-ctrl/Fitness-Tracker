import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Flag,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Settings,
  Dumbbell,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useUiStore } from "../stores/uiStore";

const links = [
  { to: "/", label: "My story", icon: LayoutDashboard },
  { to: "/log", label: "Walk quest", icon: Activity },
  { to: "/workouts", label: "Training chapters", icon: Dumbbell },
  { to: "/goals", label: "Milestones", icon: Flag },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUiStore((s) => s.toggleCollapsed);
  const open = useUiStore((s) => s.sidebarOpen);
  const setOpen = useUiStore((s) => s.setSidebarOpen);
  const logout = useAuthStore((s) => s.logout);
  const username = useAuthStore((s) => s.username);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            aria-label="Close sidebar overlay"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 84 : 260 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className={`fixed z-40 flex h-screen flex-col border-r border-[var(--ink)]/10 bg-[var(--surface)]/95 p-3 backdrop-blur-xl ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="mb-6 flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-primary-500 text-white shadow-lg shadow-violet-950/20">
              <BookOpen size={18} />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[var(--surface)] bg-amber-400" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="whitespace-nowrap"
                >
                  <p className="text-sm font-semibold">PulseTrack</p>
                  <p className="text-xs text-[var(--muted)]">Your movement journal</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="hidden rounded-full p-1.5 text-[var(--muted)] hover:bg-violet-500/10 lg:block"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {links.map((link, index) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-primary-600 text-white shadow-card"
                      : "text-[var(--muted)] hover:bg-violet-500/10 hover:text-[var(--ink)]"
                  }`
                }
              >
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * index }}
                  className="shrink-0"
                >
                  <Icon size={18} />
                </motion.span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="truncate"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-violet-500/10 bg-gradient-to-br from-violet-50 to-amber-50 p-3 dark:border-white/10 dark:from-violet-950/30 dark:to-amber-950/20">
          {!collapsed && (
            <>
              <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-200">
                <Sparkles size={12} /> Every step writes a page
              </p>
              <p className="mb-2 mt-2 truncate text-xs text-[var(--muted)]">Signed in as {username}</p>
            </>
          )}
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-rose-600 hover:bg-[var(--surface)]"
          >
            <LogOut size={16} />
            {!collapsed && "Log out"}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
