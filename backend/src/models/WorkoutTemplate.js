const mongoose = require("mongoose");

const workoutTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    durationMin: { type: Number, required: true },
    focus: { type: String, required: true },
    intensity: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    exercises: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkoutTemplate", workoutTemplateSchema);
