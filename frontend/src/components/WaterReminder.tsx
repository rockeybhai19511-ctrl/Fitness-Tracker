import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { useUiStore } from "../stores/uiStore";

export default function WaterReminder({ intervalMin }: { intervalMin: number }) {
  const showToast = useUiStore((s) => s.showToast);
  const [remaining, setRemaining] = useState(intervalMin * 60);

  useEffect(() => {
    setRemaining(intervalMin * 60);
  }, [intervalMin]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          showToast("Time to drink water — add 250ml now.", "info");
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("PulseTrack", { body: "Hydration check: drink a glass of water." });
          }
          return intervalMin * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [intervalMin, showToast]);

  const label = useMemo(() => {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, [remaining]);

  return (
    <div className="card flex items-center justify-between gap-4 p-5">
      <div>
        <p className="text-sm font-medium">Water reminder</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Next toast in {label}. Interval: {intervalMin} min.
        </p>
      </div>
      <button
        type="button"
        className="rounded-xl bg-sky-500 px-3 py-2 text-sm text-white"
        onClick={async () => {
          if ("Notification" in window && Notification.permission === "default") {
            await Notification.requestPermission();
          }
          showToast("Browser notifications enabled when allowed.", "success");
        }}
      >
        <span className="inline-flex items-center gap-2">
          <Bell size={16} /> Enable
        </span>
      </button>
    </div>
  );
}
