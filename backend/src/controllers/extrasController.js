const WorkoutTemplate = require("../models/WorkoutTemplate");
const Goal = require("../models/Goal");
const { goalSchema, validate } = require("../utils/validate");

async function listWorkouts(_req, res, next) {
  try {
    const workouts = await WorkoutTemplate.find().sort({ name: 1 });
    res.json(workouts);
  } catch (err) {
    next(err);
  }
}

async function listGoals(_req, res, next) {
  try {
    const goals = await Goal.find().sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    next(err);
  }
}

async function createGoal(req, res, next) {
  try {
    const payload = validate(goalSchema, req.body);
    const goal = await Goal.create(payload);
    res.status(201).json(goal);
  } catch (err) {
    next(err);
  }
}

module.exports = { listWorkouts, listGoals, createGoal };
