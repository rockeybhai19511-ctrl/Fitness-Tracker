export function caloriesPerStep(weightKg: number, stepLengthCm: number) {
  return 0.04 * (weightKg / 70) * (stepLengthCm / 78);
}

export function caloriesBurned(steps: number, weightKg: number, stepLengthCm: number) {
  return steps * caloriesPerStep(weightKg, stepLengthCm);
}

export function distanceMeters(steps: number, stepLengthCm: number) {
  return steps * (stepLengthCm / 100);
}

export function bmi(weightKg: number, heightCm: number) {
  const heightM = heightCm / 100;
  if (!heightM) return 0;
  return weightKg / (heightM * heightM);
}

export function healthStatus(bmiValue: number) {
  if (bmiValue < 18.5) return "underweight";
  if (bmiValue < 25) return "normal";
  if (bmiValue < 30) return "overweight";
  return "obese";
}

export function todayIso() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function toCsv(rows: Record<string, string | number>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const body = rows.map((row) => headers.map((h) => row[h]).join(","));
  return [headers.join(","), ...body].join("\n");
}
