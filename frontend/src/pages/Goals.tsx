import { FormEvent, useEffect, useState } from "react";
import { Reorder, motion } from "framer-motion";
import { api } from "../utils/api";
import { Flag, Sparkles } from "lucide-react";

type Goal = { _id: string; type: string; target: number; period: string; active: boolean };

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [type, setType] = useState("steps");
  const [target, setTarget] = useState(8000);
  const [period, setPeriod] = useState("daily");

  useEffect(() => {
    api.get<Goal[]>("/goals").then((res) => setGoals(res.data));
  }, []);

  async function addGoal(e: FormEvent) {
    e.preventDefault();
    const { data } = await api.post<Goal>("/goals", { type, target, period, active: true });
    setGoals((prev) => [data, ...prev]);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <header className="chapter-heading">
        <span className="chapter-heading__mark"><Flag size={17} /></span>
        <div>
          <p className="chapter-heading__eyebrow">Your adventure map</p>
          <h1 className="chapter-heading__title">Small promises. Meaningful milestones.</h1>
          <p className="chapter-heading__subtitle">Choose a checkpoint that makes the next chapter feel within reach.</p>
        </div>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={addGoal} className="card p-6">
        <h2 className="inline-flex items-center gap-2 text-xl font-semibold"><Sparkles size={18} className="text-amber-500" /> Set a story checkpoint</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Choose a small milestone worth celebrating. Progress is built one repeatable quest at a time.</p>
        <label className="mt-4 block text-sm">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 w-full rounded-xl border border-emerald-900/10 bg-white px-3 py-2 dark:bg-emerald-950"
        >
          <option value="steps">Steps</option>
          <option value="water">Water</option>
          <option value="calories">Calories</option>
        </select>
        <label className="mt-4 block text-sm">Target</label>
        <input
          type="number"
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          className="mt-1 w-full rounded-xl border border-emerald-900/10 bg-white px-3 py-2 dark:bg-emerald-950"
        />
        <label className="mt-4 block text-sm">Period</label>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="mt-1 w-full rounded-xl border border-emerald-900/10 bg-white px-3 py-2 dark:bg-emerald-950"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
        <button type="submit" className="mt-5 rounded-xl bg-primary-600 px-4 py-2 text-white">
          Save goal
        </button>
      </form>

      <div>
        <h2 className="mb-3 font-medium">Your active milestones</h2>
        <Reorder.Group axis="y" values={goals} onReorder={setGoals} className="space-y-3">
          {goals.map((goal) => (
            <Reorder.Item key={goal._id} value={goal} className="card cursor-grab p-4">
              <p className="font-medium capitalize">{goal.type}</p>
              <p className="text-sm text-[var(--muted)]">
                {goal.target.toLocaleString()} • {goal.period}
              </p>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
      </div>
    </motion.div>
  );
}
