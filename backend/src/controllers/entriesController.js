const StepEntry = require("../models/StepEntry");
const WaterEntry = require("../models/WaterEntry");
const { stepsSchema, waterSchema, validate } = require("../utils/validate");
const { rangeStart } = require("../utils/calculations");

async function addSteps(req, res, next) {
  try {
    const payload = validate(stepsSchema, req.body);
    const entry = await StepEntry.create(payload);
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}

async function addWater(req, res, next) {
  try {
    const payload = validate(waterSchema, req.body);
    const entry = await WaterEntry.create(payload);
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}

async function listEntries(req, res, next) {
  try {
    const type = req.query.type === "water" ? "water" : "steps";
    const range = req.query.range === "30d" ? "30d" : "7d";
    const start = rangeStart(range);
    const Model = type === "water" ? WaterEntry : StepEntry;
    const entries = await Model.find({ date: { $gte: start } }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    next(err);
  }
}

module.exports = { addSteps, addWater, listEntries };
