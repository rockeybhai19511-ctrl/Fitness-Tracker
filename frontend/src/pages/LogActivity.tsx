import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, CirclePause, Footprints, MapPin, Play, Satellite, Save, Sparkles, Trophy } from "lucide-react";
import JourneyTrail from "../components/JourneyTrail";
import { api } from "../utils/api";
import { todayIso } from "../utils/calculations";
import { useGpsStepTracker } from "../utils/useGpsStepTracker";
import type { DashboardPayload } from "../utils/types";
import { useUiStore } from "../stores/uiStore";

export default function LogActivity() {
  const [date, setDate] = useState(todayIso());
  const [steps, setSteps] = useState(8000);
  const [ml, setMl] = useState(250);
  const [stepLengthCm, setStepLengthCm] = useState(78);
  const [todaySteps, setTodaySteps] = useState(0);
  const [stepGoal, setStepGoal] = useState(8000);
  const [savingWalk, setSavingWalk] = useState(false);
  const showToast = useUiStore((s) => s.showToast);
  const tracker = useGpsStepTracker(stepLengthCm);

  useEffect(() => {
    api
      .get<DashboardPayload>("/dashboard/metrics")
      .then(({ data }) => {
        setStepLengthCm(data.settings.stepLengthCm);
        setTodaySteps(data.today.steps);
        setStepGoal(data.today.stepGoal);
      })
      .catch(() => showToast("Could not load your profile. Using the 78 cm stride and 8,000-step quest.", "warning"));
  }, [showToast]);

  async function saveSteps(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post("/entries/steps", { date: new Date(date).toISOString(), steps, source: "manual" });
      if (date === todayIso()) setTodaySteps((current) => current + steps);
      showToast("Steps saved", "success");
    } catch {
      showToast("Could not save steps. Check your connection and try again.", "warning");
    }
  }

  async function saveWater(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post("/entries/water", { date: new Date(date).toISOString(), ml });
      showToast("Water logged", "success");
    } catch {
      showToast("Could not log water. Check your connection and try again.", "warning");
    }
  }

  async function saveWalk() {
    const summary = tracker.getSummary();
    if (summary.steps < 1) {
      showToast("No steps were detected. Carry your phone while walking or log steps manually.", "warning");
      return;
    }

    setSavingWalk(true);
    try {
      await api.post("/entries/steps", {
        date: new Date().toISOString(),
        steps: summary.steps,
        source: summary.source === "motion" ? "motion" : "gps-estimate",
      });
      setTodaySteps((current) => current + summary.steps);
      showToast(
        `Walk saved: about ${summary.steps.toLocaleString()} steps over ${(summary.distanceMeters / 1000).toFixed(2)} km.`,
        "success"
      );
      tracker.reset();
    } catch {
      showToast("Could not save your walk. Your recorded session is still available to retry.", "warning");
    } finally {
      setSavingWalk(false);
    }
  }

  const questSteps = todaySteps + tracker.steps;
  const questProgress = Math.min(Math.max(questSteps / Math.max(stepGoal, 1), 0), 1);
  const earnedXp = Math.floor(questSteps / 100);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-2">
      <section className="story-panel relative overflow-hidden p-6 lg:col-span-2">
        <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-100">
              <Satellite size={14} /> Live walk
            </p>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
              {tracker.steps > 0 ? `${tracker.steps.toLocaleString()} steps into your story.` : "Every adventure begins with one step."}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Carry your phone while you walk. Its motion sensor counts steps indoors and outdoors; GPS adds distance when it has a clear signal. Sensor data and location stay on your device.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tracker.status === "tracking" ? (
              <button type="button" onClick={tracker.pause} className="button-secondary">
                <CirclePause size={17} /> Pause walk
              </button>
            ) : (
              <button type="button" onClick={tracker.start} className="button-primary" disabled={savingWalk}>
                <Play size={17} fill="currentColor" /> {tracker.status === "paused" ? "Resume walk" : "Start walk"}
              </button>
            )}
            {tracker.status === "paused" && (
              <button type="button" onClick={saveWalk} disabled={savingWalk || tracker.steps === 0} className="button-secondary">
                <Save size={17} /> {savingWalk ? "Saving..." : "Save walk"}
              </button>
            )}
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          {[
            {
              label: tracker.status === "idle"
                ? "Steps this walk"
                : tracker.stepSource === "motion"
                  ? "Phone-detected steps"
                  : "GPS-estimated steps",
              value: tracker.steps.toLocaleString(),
              icon: Footprints,
            },
            { label: "Estimated distance", value: `${tracker.distanceMeters < 1000 ? `${Math.round(tracker.distanceMeters)} m` : `${(tracker.distanceMeters / 1000).toFixed(2)} km`}`, icon: MapPin },
            {
              label: "Session time",
              value: `${Math.floor(tracker.elapsedMs / 60_000).toString().padStart(2, "0")}:${Math.floor((tracker.elapsedMs % 60_000) / 1000).toString().padStart(2, "0")}`,
              icon: Activity,
            },
          ].map(({ label, value, icon: Icon }) => (
            <motion.div key={label} layout className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
              <Icon size={17} className="text-amber-300" />
              <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
              <p className="mt-1 text-xs text-white/60">{label}</p>
            </motion.div>
          ))}
        </div>

        <div className="relative mt-5 rounded-2xl border border-white/10 bg-black/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold">
                <Trophy size={16} className="text-amber-300" /> Today's quest · {questSteps.toLocaleString()} / {stepGoal.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-white/60">
                {questProgress >= 1 ? "Quest complete! You earned today's finish badge." : `${Math.max(stepGoal - questSteps, 0).toLocaleString()} steps to today's finish badge.`}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-300/15 px-3 py-1.5 text-xs font-semibold text-amber-200">
              <Sparkles size={14} /> {earnedXp} XP
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-400 via-primary-300 to-amber-300"
              animate={{ width: `${questProgress * 100}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 20 }}
            />
          </div>
          <div className="mt-4">
            <JourneyTrail
              current={tracker.steps}
              milestones={[
                { label: "First step", detail: "5 steps", threshold: 5 },
                { label: "Warm-up", detail: "10 steps", threshold: 10 },
                { label: "Explorer", detail: "25 steps", threshold: 25 },
                { label: "Trailblazer", detail: "50 steps", threshold: 50 },
              ]}
            />
          </div>
        </div>

        <AnimatePresence>
          {tracker.error ? (
            <motion.p
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="relative mt-4 text-sm text-amber-200"
            >
              {tracker.error}
            </motion.p>
          ) : (
            <p className="relative mt-4 text-xs text-white/55">
              {tracker.status === "tracking"
                ? tracker.stepSource === "motion"
                  ? "Motion sensor is counting your steps. Keep this page open; GPS may improve distance outdoors."
                  : "GPS is estimating your steps from filtered walking distance. This is less accurate indoors."
                : "Tap Start walk and allow motion/location access if your browser asks. Motion sensing works indoors; keep this page open."}
            </p>
          )}
        </AnimatePresence>
      </section>

      <form onSubmit={saveSteps} className="card p-6">
        <h2 className="text-xl font-semibold">Log steps manually</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Calories are derived from weight and step length in Settings.
        </p>
        <label className="mt-4 block text-sm" htmlFor="date">
          Date
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded-xl border border-emerald-900/10 bg-white px-3 py-2 dark:bg-emerald-950"
        />
        <label className="mt-4 block text-sm" htmlFor="steps">
          Steps
        </label>
        <input
          id="steps"
          type="number"
          min={0}
          value={steps}
          onChange={(e) => setSteps(Number(e.target.value))}
          className="mt-1 w-full rounded-xl border border-emerald-900/10 bg-white px-3 py-2 dark:bg-emerald-950"
        />
        <button type="submit" className="mt-5 rounded-xl bg-primary-600 px-4 py-2 text-white">
          Save steps
        </button>
      </form>

      <form onSubmit={saveWater} className="card p-6">
        <h2 className="text-xl font-semibold">Log water</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Quick add glasses of water in milliliters.</p>
        <label className="mt-4 block text-sm" htmlFor="ml">
          Amount (ml)
        </label>
        <input
          id="ml"
          type="number"
          min={0}
          value={ml}
          onChange={(e) => setMl(Number(e.target.value))}
          className="mt-1 w-full rounded-xl border border-emerald-900/10 bg-white px-3 py-2 dark:bg-emerald-950"
        />
        <div className="mt-3 flex gap-2">
          {[250, 500, 750].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setMl(n)}
              className="rounded-full bg-sky-50 px-3 py-1 text-sm dark:bg-sky-900/40"
            >
              {n} ml
            </button>
          ))}
        </div>
        <button type="submit" className="mt-5 rounded-xl bg-sky-500 px-4 py-2 text-white">
          Save water
        </button>
      </form>
    </motion.div>
  );
}
