require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDb } = require("./config/db");
const Admin = require("./models/Admin");
const Settings = require("./models/Settings");
const StepEntry = require("./models/StepEntry");
const WaterEntry = require("./models/WaterEntry");
const WorkoutTemplate = require("./models/WorkoutTemplate");
const Goal = require("./models/Goal");

function daysAgo(n) {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

async function seed() {
  await connectDb(process.env.MONGO_URI);

  const username = process.env.ADMIN_USER || "admin";
  const password = process.env.ADMIN_PASS || "admin123";
  const passwordHash = await bcrypt.hash(password, 10);

  await Admin.findOneAndUpdate(
    { username },
    { username, passwordHash },
    { upsert: true, new: true }
  );

  await Settings.findOneAndUpdate(
    {},
    {
      stepLengthCm: 78,
      weightKg: 70,
      heightCm: 172,
      waterGoalMl: 2500,
      reminderIntervalMin: 120,
      stepGoal: 8000,
      calorieGoal: 400,
    },
    { upsert: true }
  );

  const stepCount = await StepEntry.countDocuments();
  if (stepCount === 0) {
    const stepPattern = [8120, 6400, 9100, 10420, 7340, 12100, 8800, 5600, 9900, 11300, 7200, 8450, 10150, 9600];
    const waterPattern = [2100, 1800, 2600, 2400, 1900, 2800, 2300, 1700, 2500, 2700, 2000, 2200, 2550, 2450];

    await StepEntry.insertMany(
      stepPattern.map((steps, i) => ({
        date: daysAgo(stepPattern.length - 1 - i),
        steps,
        source: "seed",
      }))
    );
    await WaterEntry.insertMany(
      waterPattern.map((ml, i) => ({
        date: daysAgo(waterPattern.length - 1 - i),
        ml,
      }))
    );
  }

  const workoutCount = await WorkoutTemplate.countDocuments();
  if (workoutCount === 0) {
    await WorkoutTemplate.insertMany([
      {
        name: "Morning Mobility",
        durationMin: 20,
        focus: "Flexibility",
        intensity: "low",
        exercises: ["Cat-cow", "World's greatest stretch", "Ankle rocks", "Hip openers"],
      },
      {
        name: "Desk Reset Walk",
        durationMin: 30,
        focus: "Cardio",
        intensity: "medium",
        exercises: ["Brisk walk", "Stair repeats", "Calf raises"],
      },
      {
        name: "Full Body Express",
        durationMin: 35,
        focus: "Strength",
        intensity: "high",
        exercises: ["Squats", "Push-ups", "Rows", "Plank"],
      },
    ]);
  }

  const goalCount = await Goal.countDocuments();
  if (goalCount === 0) {
    await Goal.insertMany([
      { type: "steps", target: 8000, period: "daily", active: true },
      { type: "water", target: 2500, period: "daily", active: true },
      { type: "calories", target: 2500, period: "weekly", active: true },
    ]);
  }

  console.log("Seed complete");
  console.log(`Admin login: ${username} / ${password}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
