import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

type Props = {
  label: string;
  value: number;
  suffix?: string;
  hint: string;
  accent?: string;
};

export default function MetricCard({ label, value, suffix = "", hint, accent = "from-violet-500 to-primary-300" }: Props) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    Number.isInteger(value) ? Math.round(latest).toLocaleString() : latest.toFixed(1)
  );

  useEffect(() => {
    const controls = animate(count, value, { duration: 0.9, ease: "easeOut" });
    return controls.stop;
  }, [count, value]);

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      className="card relative overflow-hidden p-5"
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">
        <motion.span>{rounded}</motion.span>
        {suffix && <span className="ml-1 text-base font-medium">{suffix}</span>}
      </p>
      <p className="mt-3 text-xs text-[var(--muted)]">{hint}</p>
    </motion.article>
  );
}
