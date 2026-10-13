# PulseTrack — Fitness Tracker System

Undergraduate mini project: MERN fitness tracker styled as a living trail journal—daily movement unfolds into story chapters, connected quest milestones, and earned badges. Built with Vite + React + TypeScript, Framer Motion, and a single admin JWT login.

## Features

- Admin-only login (no public signup)
- Dark / light theme with localStorage persistence and animated toggle
- Story-and-quest experience: daily chapters, animated milestone badges, walk rewards, and Framer Motion transitions
- Collapsible journal sidebar (icons + labels ↔ icons only) with Framer Motion
- Dashboard cards: steps, calories, active minutes, BMI, heart rate placeholder, water
- Derived metrics: distance, calories from steps, BMI health status, weekly suggestion
- Weekly / monthly Recharts graphs
- Manual steps and water logging
- Live walk tracking with phone motion-sensor steps and filtered GPS distance / step-estimate fallback
- Water reminder countdown + optional browser notification
- Settings for step length, weight, height, water goal, reminder interval
- Weight-aware workout starter guide, workout calorie estimates, goals with reorder, streak, CSV export

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 18, Vite, TypeScript, TailwindCSS (`darkMode: 'class'`), Framer Motion, Zustand, React Router, Recharts, Axios |
| Backend | Node.js, Express, Mongoose, Joi, JWT, bcryptjs |
| Database | MongoDB (local or Atlas) |

## Demo credentials (evaluation only)

- Username: `admin`
- Password: `admin123`

Change these in `backend/.env` (`ADMIN_USER`, `ADMIN_PASS`) and re-run the seed script.

## Prerequisites

- Node.js 18+
- MongoDB running locally **or** a MongoDB Atlas connection string

If `npm` is not recognized in PowerShell, add Node to PATH or call it directly:

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
```

## Local setup

### 1. Backend

```powershell
cd backend
copy .env.example .env
npm install
npm run seed
npm run dev
```

API: `http://localhost:5000`
Health check: `http://localhost:5000/api/health`

Environment variables:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/fitness-tracker
JWT_SECRET=change-this-mini-project-secret
ADMIN_USER=admin
ADMIN_PASS=admin123
FRONTEND_ORIGIN=http://localhost:5173
```

For Atlas, set `MONGO_URI` to your cluster URI.

### 2. Frontend

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173`

`VITE_API_URL` should point at the API, e.g. `http://localhost:5000/api`.

### 3. Calculation tests

```powershell
cd backend
npm test
```

## Fitness formulas

- Distance (m) = `steps * (stepLengthCm / 100)`
- Motion-sensor walks count filtered acceleration peaks with a cadence limit; when the browser cannot provide motion data, GPS fallback steps = `floor(filtered GPS walking distance / configured stride length)`. GPS fallback is an estimate, not a phone motion-sensor count.
- Workout energy estimate (kcal) = `MET * 3.5 * weightKg / 200 * minutes`; MET values are rough intensity assumptions.
- Calories/step = `0.04 * (weightKg / 70) * (stepLengthCm / 78)` (weight-normalized so ~8k steps ≈ 400 kcal)
- Calories = `steps * caloriesPerStep`
- BMI = `weightKg / (heightM * heightM)`
- Status: underweight &lt; 18.5, normal &lt; 25, overweight &lt; 30, else obese

Phone motion tracking needs a supported mobile browser and (on some iPhones) motion permission. Keep the walk page open during the session. GPS needs browser location permission and a secure context (HTTPS or localhost); GPS is used to add distance and to estimate steps only if motion sensing is unavailable. Inaccurate fixes and implausible walking speeds are filtered, so GPS-only estimates may not register very short indoor walks. Sensor readings and GPS locations stay in the active browser session and are not uploaded or stored; only the step count is saved when the user saves a walk.

The workout guide uses saved weight and BMI to select a gentle starting template and personalize rough energy estimates. BMI is only a broad screening measure; the guide is not medical advice.

Daily quest XP is a display score (`floor(today's steps / 100)`), and walk badges unlock at 5, 10, 25, and 50 steps in one tracked session. These are derived from recorded activity and are not a separate currency or stored reward balance.

## API

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | No | Admin login, returns JWT |
| GET | `/api/auth/me` | Yes | Current admin |
| GET | `/api/dashboard/metrics?range=7d\|30d` | Yes | Aggregated dashboard |
| POST | `/api/entries/steps` | Yes | `{ date, steps, source }` |
| POST | `/api/entries/water` | Yes | `{ date, ml }` |
| GET | `/api/entries?type=steps&range=7d` | Yes | List entries |
| GET/PUT | `/api/settings` | Yes | Admin defaults |
| GET | `/api/workouts` | Yes | Sample templates |
| GET/POST | `/api/goals` | Yes | Goal setting |

Protected routes expect `Authorization: Bearer <token>`.

## Deployment (suggested)

1. Backend on Render/Railway: start command `npm start`, set env vars, run seed once.
2. Frontend on Vercel/Netlify: build `npm run build`, output `dist`, set `VITE_API_URL` to the public API `/api` URL.
3. MongoDB Atlas for the database.
4. CORS: set `FRONTEND_ORIGIN` to the Vercel URL.

This repo includes `frontend/vercel.json` for SPA rewrites.

## Security notes (mini project)

Implemented: hashed admin password, JWT, Joi validation.

Not in scope: HTTPS enforcement, rate limiting, HttpOnly cookies, OAuth, multi-user accounts. Those are reasonable future improvements.

## Video demo checklist

1. Login as admin (theme toggle on the login screen).
2. Collapse / expand the sidebar with the arrow.
3. Show metric cards, charts, streak, and water countdown.
4. Log steps and water; open Settings and save BMI-related defaults.
5. Reorder a goal; export CSV.

## Project structure

```
frontend/src   components, pages, stores, utils
backend/src   controllers, models, routes, middleware, seed.js
```
