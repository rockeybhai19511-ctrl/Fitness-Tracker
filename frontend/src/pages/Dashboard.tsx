import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Footprints, Sparkles, Star, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import MetricCard from "../components/MetricCard";
import ProgressChart from "../components/ProgressChart";
import JourneyTrail from "../components/JourneyTrail";
import WaterReminder from "../components/WaterReminder";
import { api } from "../utils/api";
import type { DashboardPayload } from "../utils/types";
import { toCsv } from "../utils/calculations";
import { useUiStore } from "../stores/uiStore";

export default function Dashboard() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [range, setRange] = useState<"7d" | "30d">("7d");
  const showToast = useUiStore((s) => s.showToast);

  useEffect(() => {
    api
      .get<DashboardPayload>("/dashboard/metrics", { params: { range } })
      .then((res) => setData(res.data))
      .catch(() => showToast("Could not load metrics. Is the API running?", "warning"));
  }, [range, showToast]);

  if (!data) {
    return <p className="p-6 text-sm">Loading dashboard...</p>;
  }

  const { today, summary, series, settings } = data;
  const stepProgress = Math.min(Math.max(today.steps / Math.max(today.stepGoal, 1), 0), 1);
  const chapter = summary.streak >= 7 ? "Momentum maker" : summary.streak >= 3 ? "Finding your rhythm" : "Everyday explorer";
  const checkpoint = [0.25, 0.5, 0.75, 1].find((milestone) => stepProgress < milestone);
  const checkpointSteps = checkpoint ? Math.ceil(today.stepGoal * checkpoint) : today.stepGoal;
  const checkpointCopy = checkpoint
    ? `${Math.max(checkpointSteps - today.steps, 0).toLocaleString()} steps to your next checkpoint`
    : "Daily quest complete — you showed up for yourself";
  const earnedXp = Math.floor(today.steps / 100);
  const milestones = [
    { label: "First spark", detail: `${Math.ceil(today.stepGoal * 0.25).toLocaleString()} steps`, threshold: today.stepGoal * 0.25 },
    { label: "Finding rhythm", detail: `${Math.ceil(today.stepGoal * 0.5).toLocaleString()} steps`, threshold: today.stepGoal * 0.5 },
    { label: "On a roll", detail: `${Math.ceil(today.stepGoal * 0.75).toLocaleString()} steps`, threshold: today.stepGoal * 0.75 },
    { label: "Quest complete", detail: `${today.stepGoal.toLocaleString()} steps`, threshold: today.stepGoal },
  ];

  function exportCsv() {
    const csv = toCsv(series);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulsetrack-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Your story, in motion</h1>
          <p className="text-sm text-[var(--muted)]">{summary.suggestion}</p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-full px-3 py-1 text-sm ${range === r ? "bg-primary-600 text-white" : "card px-3"}`}
            >
              {r === "7d" ? "Weekly" : "Monthly"}
            </button>
          ))}
          <button type="button" onClick={exportCsv} className="rounded-full bg-accent-600 px-3 py-1 text-sm text-white">
            Export CSV
          </button>
        </div>
      </div>

      <section className="story-panel relative overflow-hidden p-6 md:p-8">
        <div className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full bg-primary-300/20 blur-3xl" />
        <div className="relative grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
              <Sparkles size={14} /> Today's chapter · {chapter}
            </p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              {today.steps >= today.stepGoal ? "Quest complete. Take a moment to celebrate." : "Small steps make a story worth telling."}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/75">{checkpointCopy}. Every walk counts—your pace, your progress.</p>
            <Link to="/log" className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-primary-100">
              <Footprints size={17} /> Start a walk <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex items-center gap-5 rounded-2xl border border-white/15 bg-black/15 p-5 backdrop-blur md:min-w-64 md:flex-col md:gap-2">
            <div className="relative grid h-28 w-28 shrink-0 place-items-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="43" fill="none" stroke="white" strokeOpacity="0.16" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="43" fill="none" stroke="#c4b5fd" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 43}
                  initial={{ strokeDashoffset: 2 * Math.PI * 43 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 43 * (1 - stepProgress) }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                />
              </svg>
              <div className="text-center">
                <p className="text-2xl font-semibold tabular-nums">{Math.round(stepProgress * 100)}%</p>
                <p className="text-[10px] uppercase tracking-wider text-white/65">of today's goal</p>
              </div>
            </div>
            <div>
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold"><Trophy size={15} className="text-amber-300" /> Daily quest</p>
              <p className="mt-1 text-xs text-white/70">{today.steps.toLocaleString()} / {today.stepGoal.toLocaleString()} steps</p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-200"><Sparkles size={13} /> {earnedXp} XP earned today</p>
            </div>
          </div>
        </div>
        <div className="relative mt-6 border-t border-white/10 pt-5">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
            <Star size={14} className="text-amber-300" /> The trail ahead
          </div>
          <JourneyTrail current={today.steps} milestones={milestones} />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Steps" value={today.steps} hint={`Goal ${today.stepGoal.toLocaleString()} • ${today.distanceKm} km`} />
        <MetricCard
          label="Calories burned"
          value={today.calories}
          suffix="kcal"
          hint={`Goal ${today.calorieGoal} kcal`}
          accent="from-violet-500 to-fuchsia-400"
        />
        <MetricCard label="Active minutes" value={today.activeMinutes} suffix="min" hint="Approx. 100 steps = 1 minute" />
        <MetricCard
          label="BMI"
          value={today.bmi}
          hint={`Status: ${today.healthStatus}`}
          accent="from-amber-500 to-orange-400"
        />
        <MetricCard
          label="Heart rate"
          value={today.heartRate}
          suffix="bpm"
          hint="Placeholder estimate from step volume"
          accent="from-rose-500 to-orange-400"
        />
        <MetricCard
          label="Water intake"
          value={today.waterMl}
          suffix="ml"
          hint={`Goal ${today.waterGoalMl} ml`}
          accent="from-sky-500 to-cyan-400"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 font-medium">Your progress trail</h2>
          <ProgressChart data={series} />
        </div>
        <div className="space-y-4">
          <div className="card p-5">
            <p className="text-sm">Chapter streak</p>
            <p className="mt-2 text-4xl font-semibold">{summary.streak} days</p>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Avg steps {summary.avgSteps.toLocaleString()} • water {summary.waterCompliance}%
            </p>
          </div>
          <WaterReminder intervalMin={settings.reminderIntervalMin} />
        </div>
      </div>
    </motion.div>
  );
}
