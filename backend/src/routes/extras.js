const { Router } = require("express");
const { listWorkouts, listGoals, createGoal } = require("../controllers/extrasController");
const { requireAuth } = require("../middleware/auth");

const router = Router();
router.use(requireAuth);
router.get("/workouts", listWorkouts);
router.get("/goals", listGoals);
router.post("/goals", createGoal);

module.exports = router;
