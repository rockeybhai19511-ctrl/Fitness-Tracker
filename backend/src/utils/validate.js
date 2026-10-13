const Joi = require("joi");

const loginSchema = Joi.object({
  username: Joi.string().trim().min(3).max(40).required(),
  password: Joi.string().min(4).max(80).required(),
});

const stepsSchema = Joi.object({
  date: Joi.date().iso().required(),
  steps: Joi.number().integer().min(0).max(100000).required(),
  source: Joi.string().trim().max(40).default("manual"),
});

const waterSchema = Joi.object({
  date: Joi.date().iso().required(),
  ml: Joi.number().integer().min(0).max(10000).required(),
});

const settingsSchema = Joi.object({
  stepLengthCm: Joi.number().min(30).max(120),
  weightKg: Joi.number().min(30).max(250),
  heightCm: Joi.number().min(100).max(230),
  waterGoalMl: Joi.number().min(500).max(8000),
  reminderIntervalMin: Joi.number().min(15).max(480),
  stepGoal: Joi.number().min(1000).max(50000),
  calorieGoal: Joi.number().min(50).max(5000),
});

const goalSchema = Joi.object({
  type: Joi.string().valid("steps", "water", "calories").required(),
  target: Joi.number().positive().required(),
  period: Joi.string().valid("daily", "weekly").default("daily"),
  active: Joi.boolean().default(true),
});

function validate(schema, payload) {
  const { error, value } = schema.validate(payload, { abortEarly: false, stripUnknown: true });
  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    const err = new Error(message);
    err.status = 400;
    throw err;
  }
  return value;
}

module.exports = {
  loginSchema,
  stepsSchema,
  waterSchema,
  settingsSchema,
  goalSchema,
  validate,
};
