const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    stepLengthCm: { type: Number, default: 78 },
    weightKg: { type: Number, default: 70 },
    heightCm: { type: Number, default: 170 },
    waterGoalMl: { type: Number, default: 2500 },
    reminderIntervalMin: { type: Number, default: 120 },
    stepGoal: { type: Number, default: 8000 },
    calorieGoal: { type: Number, default: 400 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
