import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { api } from "../utils/api";
import { bmi, caloriesPerStep, healthStatus } from "../utils/calculations";
import { useUiStore } from "../stores/uiStore";

type SettingsForm = {
  stepLengthCm: number;
  weightKg: number;
  heightCm: number;
  waterGoalMl: number;
  reminderIntervalMin: number;
  stepGoal: number;
  calorieGoal: number;
};

const empty: SettingsForm = {
  stepLengthCm: 78,
  weightKg: 70,
  heightCm: 172,
  waterGoalMl: 2500,
  reminderIntervalMin: 120,
  stepGoal: 8000,
  calorieGoal: 400,
};

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsForm>(empty);
  const showToast = useUiStore((s) => s.showToast);
  const bmiValue = bmi(form.weightKg, form.heightCm);

  useEffect(() => {
    api.get<SettingsForm>("/settings").then((res) => setForm({ ...empty, ...res.data }));
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    await api.put("/settings", form);
    showToast("Settings updated", "success");
  }

  return (
    <motion.form
      onSubmit={save}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card max-w-2xl p-6"
    >
      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary-700 dark:text-primary-300">
        <SlidersHorizontal size={14} /> Tune your adventure
      </p>
      <h1 className="mt-2 text-2xl font-semibold">Your movement settings</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Tune your stride, profile, and daily quests. These values personalize distance and workout estimates.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {(
          [
            ["weightKg", "Weight (kg)"],
            ["heightCm", "Height (cm)"],
            ["stepLengthCm", "Step length (cm)"],
            ["waterGoalMl", "Water goal (ml)"],
            ["reminderIntervalMin", "Reminder interval (min)"],
            ["stepGoal", "Daily step goal"],
            ["calorieGoal", "Daily calorie goal"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="text-sm">
            {label}
            <input
              type="number"
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
              className="mt-1 w-full rounded-xl border border-emerald-900/10 bg-white px-3 py-2 dark:bg-emerald-950"
            />
          </label>
        ))}
      </div>
      <p className="mt-4 text-sm">
        Preview BMI: <strong>{bmiValue.toFixed(1)}</strong> ({healthStatus(bmiValue)}) • kcal/step{" "}
        {caloriesPerStep(form.weightKg, form.stepLengthCm).toFixed(3)}
      </p>
      <button type="submit" className="mt-5 rounded-xl bg-primary-600 px-4 py-2 text-white">
        Save settings
      </button>
    </motion.form>
  );
}
