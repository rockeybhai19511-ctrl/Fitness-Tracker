export type TodayMetrics = {
  steps: number;
  calories: number;
  activeMinutes: number;
  bmi: number;
  healthStatus: string;
  heartRate: number;
  waterMl: number;
  distanceKm: number;
  waterGoalMl: number;
  stepGoal: number;
  calorieGoal: number;
};

export type DashboardPayload = {
  today: TodayMetrics;
  summary: {
    avgSteps: number;
    avgCalories: number;
    waterCompliance: number;
    streak: number;
    suggestion: string;
  };
  series: { date: string; steps: number; water: number; calories: number }[];
  settings: {
    stepLengthCm: number;
    weightKg: number;
    heightCm: number;
    waterGoalMl: number;
    reminderIntervalMin: number;
    stepGoal: number;
    calorieGoal: number;
  };
  goals: { _id: string; type: string; target: number; period: string; active: boolean }[];
};

export type Workout = {
  _id: string;
  name: string;
  durationMin: number;
  focus: string;
  intensity: string;
  exercises: string[];
};
