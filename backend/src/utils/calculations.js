function caloriesPerStep(weightKg, stepLengthCm) {
  return 0.04 * (weightKg / 70) * (stepLengthCm / 78);
}

function caloriesBurned(steps, weightKg, stepLengthCm) {
  return steps * caloriesPerStep(weightKg, stepLengthCm);
}

function distanceMeters(steps, stepLengthCm) {
  return steps * (stepLengthCm / 100);
}

function bmi(weightKg, heightCm) {
  const heightM = heightCm / 100;
  if (!heightM) return 0;
  return weightKg / (heightM * heightM);
}

function healthStatus(bmiValue) {
  if (bmiValue < 18.5) return "underweight";
  if (bmiValue < 25) return "normal";
  if (bmiValue < 30) return "overweight";
  return "obese";
}

function healthSuggestion({ avgSteps, waterCompliance, status }) {
  if (avgSteps < 7000) return "Increase daily steps by 10% to build a stronger streak.";
  if (waterCompliance < 80) return "Drink about 200ml more to meet your water goal.";
  if (status === "overweight" || status === "obese") {
    return "Pair walking with a consistent calorie deficit and hydration.";
  }
  if (status === "underweight") return "Add strength sessions and nutrient-dense meals.";
  return "Great consistency — keep your current pace this week.";
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateKey(date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function rangeStart(range) {
  const now = new Date();
  const start = startOfDay(now);
  if (range === "30d") {
    start.setDate(start.getDate() - 29);
  } else {
    start.setDate(start.getDate() - 6);
  }
  return start;
}

module.exports = {
  caloriesPerStep,
  caloriesBurned,
  distanceMeters,
  bmi,
  healthStatus,
  healthSuggestion,
  startOfDay,
  dateKey,
  rangeStart,
};
