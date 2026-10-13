const mongoose = require("mongoose");

const waterEntrySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, index: true },
    ml: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WaterEntry", waterEntrySchema);
