const test = require("node:test");
const assert = require("node:assert/strict");
const {
  caloriesBurned,
  distanceMeters,
  bmi,
  healthStatus,
} = require("./calculations");

test("distance uses step length", () => {
  assert.equal(distanceMeters(1000, 78), 780);
});

test("calories scale with weight", () => {
  const light = caloriesBurned(1000, 60, 78);
  const heavy = caloriesBurned(1000, 80, 78);
  assert.ok(heavy > light);
});

test("bmi classification", () => {
  assert.equal(healthStatus(17), "underweight");
  assert.equal(healthStatus(22), "normal");
  assert.equal(healthStatus(27), "overweight");
  assert.equal(healthStatus(32), "obese");
  assert.ok(Math.abs(bmi(70, 175) - 22.86) < 0.02);
});
