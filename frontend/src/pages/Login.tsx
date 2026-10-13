import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { useAuthStore } from "../stores/authStore";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { username, password });
      setAuth(data.token, data.username);
      navigate("/");
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)]">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <motion.div
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary-400/30 blur-3xl"
        animate={{ x: [0, 20, 0], y: [0, 12, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
      />
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4">
        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mx-auto w-full max-w-md p-8"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-primary-600">PulseTrack · Your movement journal</p>
          <h1 className="mt-2 text-3xl font-semibold">Begin your next chapter.</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Sign in to pick up your daily quests and celebrate each milestone.
          </p>
          <label className="mt-6 block text-sm" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className="mt-1 w-full rounded-xl border border-[var(--ink)]/10 bg-[var(--surface)] px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <label className="mt-4 block text-sm" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="mt-1 w-full rounded-xl border border-[var(--ink)]/10 bg-[var(--surface)] px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-primary-600 py-2.5 font-medium text-white disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Enter dashboard"}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
