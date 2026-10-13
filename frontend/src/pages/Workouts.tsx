import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Clock3, Flame, Heart, Sparkles, Zap, BookOpen } from "lucide-react";
import { api } from "../utils/api";
import { bmi, healthStatus } from "../utils/calculations";
import type { DashboardPayload, Workout } from "../utils/types";
import { useUiStore } from "../stores/uiStore";

const intensityMet: Record<Workout["intensity"], number> = { low: 2.8, medium: 4.3, high: 6 };

export default function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [profile, setProfile] = useState<DashboardPayload["settings"] | null>(null);
  const showToast = useUiStore((s) => s.showToast);

  useEffect(() => {
    Promise.all([api.get<Workout[]>("/workouts"), api.get<DashboardPayload>("/dashboard/metrics")])
      .then(([workoutResponse, dashboardResponse]) => {
        setWorkouts(workoutResponse.data);
        setProfile(dashboardResponse.data.settings);
      })
      .catch(() => showToast("Could not load workouts and your profile. Is the API running?", "warning"));
  }, [showToast]);

  const plan = useMemo(() => {
    if (!profile) return null;
    const bodyMassIndex = bmi(profile.weightKg, profile.heightCm);
    const status = healthStatus(bodyMassIndex);
    const cautiousStart = status === "underweight" || status === "obese";
    const preferredIntensity: Workout["intensity"] = cautiousStart ? "low" : "medium";
    const recommended =
      workouts.find((workout) => workout.intensity === preferredIntensity) ??
      workouts.find((workout) => workout.intensity === "low") ??
      workouts[0];
    const duration = recommended ? Math.min(recommended.durationMin, cautiousStart ? 20 : 30) : 0;
    const estimatedCalories = recommended
      ? Math.round((intensityMet[recommended.intensity] * 3.5 * profile.weightKg * duration) / 200)
      : 0;

    const headline =
      status === "underweight"
        ? "Build a gentle, steady foundation."
        : status === "obese"
          ? "Start with a low-impact win."
          : status === "overweight"
            ? "Build consistency, one session at a time."
            : "Your next chapter starts with a balanced session.";
    const detail =
      status === "underweight"
        ? "A short mobility or strength session is a gentle place to begin. Consider checking with a healthcare professional before increasing training."
        : status === "obese"
          ? "A comfortable, low-impact session keeps the first step manageable. Pause if anything feels painful or unusually difficult."
          : status === "overweight"
            ? "Begin at a conversational pace and build duration gradually as the sessions feel comfortable."
            : "Keep the effort comfortable, then progress duration or intensity gradually as your routine settles in.";

    return { bodyMassIndex, status, recommended, duration, estimatedCalories, headline, detail };
  }, [profile, workouts]);

  if (!profile || !plan) return <p className="p-6 text-sm">Building your workout guide...</p>;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <header className="chapter-heading">
        <span className="chapter-heading__mark"><BookOpen size={17} /></span>
        <div>
          <p className="chapter-heading__eyebrow">Choose your next chapter</p>
          <h2 className="chapter-heading__title">Training that meets you where you are.</h2>
          <p className="chapter-heading__subtitle">A suggested starting point, shaped by your profile and built for steady progress.</p>
        </div>
      </header>
      <section className="story-panel relative overflow-hidden p-6 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary-300/20 blur-3xl" />
        <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
              <Sparkles size={14} /> Your personal training chapter
            </p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">{plan.headline}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">{plan.detail}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white/10 px-3 py-1.5">Profile weight {profile.weightKg} kg</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">BMI {plan.bodyMassIndex.toFixed(1)} · {plan.status}</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">Personalized to your profile</span>
            </div>
          </div>
          {plan.recommended && (
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 180, damping: 20 }}
              className="w-full rounded-2xl border border-white/15 bg-black/15 p-5 backdrop-blur md:w-64"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-200">Today's starting point</p>
              <p className="mt-2 text-lg font-semibold">{plan.recommended.name}</p>
              <p className="mt-1 text-sm text-white/70">{plan.duration} comfortable minutes</p>
              <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-4 text-sm">
                <span className="inline-flex items-center gap-2 text-white/75"><Flame size={15} /> Estimated energy</span>
                <strong>~{plan.estimatedCalories} kcal</strong>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Choose your next session</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Every session is a checkpoint. Start comfortably; progress at your own pace.</p>
        </div>
        <div className="hidden rounded-full bg-primary-500/10 px-3 py-2 text-xs font-medium text-primary-700 dark:text-primary-300 sm:flex sm:items-center sm:gap-2">
          <Heart size={15} /> Listen to your body
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workouts.map((workout, index) => {
          const isRecommended = workout._id === plan.recommended?._id;
          const duration = isRecommended ? plan.duration : workout.durationMin;
          const calories = Math.round((intensityMet[workout.intensity] * 3.5 * profile.weightKg * duration) / 200);
          const Icon = workout.intensity === "low" ? Heart : workout.intensity === "high" ? Zap : Activity;

          return (
            <motion.article
              key={workout._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              whileHover={{ y: -4 }}
              className={`card p-5 ${isRecommended ? "ring-2 ring-primary-500/50" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-500/10 text-primary-700 dark:text-primary-300">
                  <Icon size={19} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Chapter {String(index + 1).padStart(2, "0")}
                </span>
                {isRecommended && (
                  <span className="rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-700 dark:text-primary-300">
                    Recommended start
                  </span>
                )}
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary-700 dark:text-primary-300">{workout.focus}</p>
              <h3 className="mt-1 text-lg font-semibold">{workout.name}</h3>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                <span className="inline-flex items-center gap-1.5"><Clock3 size={14} />{duration} min</span>
                <span className="capitalize">{workout.intensity} effort</span>
                <span className="inline-flex items-center gap-1"><Flame size={14} />~{calories} kcal</span>
              </div>
              <ul className="mt-4 space-y-2 border-t border-[var(--ink)]/5 pt-4 text-sm">
                {workout.exercises.map((exercise) => (
                  <li key={exercise} className="flex gap-2">
                    <span className="text-primary-600 dark:text-primary-300">•</span>{exercise}
                  </li>
                ))}
              </ul>
            </motion.article>
          );
        })}
      </div>

      <p className="text-xs leading-5 text-[var(--muted)]">
        Calorie numbers are rough estimates using session intensity (MET), duration, and your saved weight—not measurements. BMI is a broad screening measure, not a diagnosis or a measure of fitness. This guide is general information, not medical advice.
      </p>
    </motion.div>
  );
}
