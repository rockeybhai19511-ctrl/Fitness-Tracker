const Settings = require("../models/Settings");
const { settingsSchema, validate } = require("../utils/validate");

async function getSettings(req, res, next) {
  try {
    const settings = (await Settings.findOne()) || (await Settings.create({}));
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const payload = validate(settingsSchema, req.body);
    const settings =
      (await Settings.findOneAndUpdate({}, payload, { new: true })) ||
      (await Settings.create(payload));
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSettings, updateSettings };
