import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../stores/themeStore";

export default function ThemeToggle() {
  const { theme, toggle } = useThemeStore();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="relative flex h-10 w-[4.5rem] items-center rounded-full border border-violet-950/10 bg-violet-100/70 px-1 dark:border-white/10 dark:bg-white/5"
    >
      <motion.span
        layout
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow"
        animate={{ x: dark ? 32 : 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {dark ? <Moon size={16} /> : <Sun size={16} />}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </button>
  );
}
