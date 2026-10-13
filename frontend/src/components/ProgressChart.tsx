import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { date: string; steps: number; calories: number; water: number };

export default function ProgressChart({ data }: { data: Point[] }) {
  const rows = data.map((d) => ({ ...d, label: d.date.slice(5) }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.25} />
          <XAxis dataKey="label" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="steps" stroke="#8b6cf6" strokeWidth={2.8} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="calories" stroke="#f59e0b" strokeWidth={2.4} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="water" stroke="#38bdf8" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
