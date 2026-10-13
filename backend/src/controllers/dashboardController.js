const StepEntry = require("../models/StepEntry");
const WaterEntry = require("../models/WaterEntry");
const Settings = require("../models/Settings");
const Goal = require("../models/Goal");
const {
  caloriesBurned,
  distanceMeters,
  bmi,
  healthStatus,
  healthSuggestion,
  startOfDay,
  dateKey,
  rangeStart,
} = require("../utils/calculations");

function streakFromDates(keys, todayKey) {
  const set = new Set(keys);
  let streak = 0;
  const cursor = new Date(`${todayKey}T00:00:00`);
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

async function getMetrics(req, res, next) {
  try {
    const range = req.query.range === "30d" ? "30d" : "7d";
    const start = rangeStart(range);
    const today = startOfDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const settings = (await Settings.findOne()) || (await Settings.create({}));
    const [steps, water, goals] = await Promise.all([
      StepEntry.find({ date: { $gte: start } }).sort({ date: 1 }),
      WaterEntry.find({ date: { $gte: start } }).sort({ date: 1 }),
      Goal.find({ active: true }),
    ]);

    const todaySteps = steps
      .filter((s) => s.date >= today && s.date < tomorrow)
      .reduce((sum, s) => sum + s.steps, 0);
    const todayWater = water
      .filter((w) => w.date >= today && w.date < tomorrow)
      .reduce((sum, w) => sum + w.ml, 0);

    const calories = caloriesBurned(todaySteps, settings.weightKg, settings.stepLengthCm);
    const distance = distanceMeters(todaySteps, settings.stepLengthCm);
    const bmiValue = bmi(settings.weightKg, settings.heightCm);
    const status = healthStatus(bmiValue);

    const byDay = {};
    const days = range === "30d" ? 30 : 7;
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      byDay[dateKey(d)] = { date: dateKey(d), steps: 0, water: 0, calories: 0 };
    }

    steps.forEach((entry) => {
      const key = dateKey(entry.date);
      if (byDay[key]) byDay[key].steps += entry.steps;
    });
    water.forEach((entry) => {
      const key = dateKey(entry.date);
      if (byDay[key]) byDay[key].water += entry.ml;
    });
    Object.values(byDay).forEach((day) => {
      day.calories = caloriesBurned(day.steps, settings.weightKg, settings.stepLengthCm);
    });

    const series = Object.values(byDay);
    const avgSteps = series.reduce((s, d) => s + d.steps, 0) / series.length;
    const avgCalories = series.reduce((s, d) => s + d.calories, 0) / series.length;
    const waterCompliance =
      series.reduce((s, d) => s + Math.min(1, d.water / settings.waterGoalMl), 0) / series.length * 100;

    const activityDays = series.filter((d) => d.steps > 0).map((d) => d.date);
    const streak = streakFromDates(activityDays, dateKey(today));

    const heartRate = Math.round(68 + Math.min(22, todaySteps / 900));

    res.json({
      today: {
        steps: todaySteps,
        calories: Number(calories.toFixed(1)),
        activeMinutes: Math.round(todaySteps / 100),
        bmi: Number(bmiValue.toFixed(1)),
        healthStatus: status,
        heartRate,
        waterMl: todayWater,
        distanceKm: Number((distance / 1000).toFixed(2)),
        waterGoalMl: settings.waterGoalMl,
        stepGoal: settings.stepGoal,
        calorieGoal: settings.calorieGoal,
      },
      summary: {
        avgSteps: Math.round(avgSteps),
        avgCalories: Number(avgCalories.toFixed(1)),
        waterCompliance: Number(waterCompliance.toFixed(1)),
        streak,
        suggestion: healthSuggestion({ avgSteps, waterCompliance, status }),
      },
      series,
      settings,
      goals,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMetrics };
