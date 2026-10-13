const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["steps", "water", "calories"], required: true },
    target: { type: Number, required: true },
    period: { type: String, enum: ["daily", "weekly"], default: "daily" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);
