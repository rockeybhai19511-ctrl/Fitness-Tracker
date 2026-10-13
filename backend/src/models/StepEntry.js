const mongoose = require("mongoose");

const stepEntrySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, index: true },
    steps: { type: Number, required: true, min: 0 },
    source: { type: String, default: "manual" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StepEntry", stepEntrySchema);
