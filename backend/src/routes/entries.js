const { Router } = require("express");
const { addSteps, addWater, listEntries } = require("../controllers/entriesController");
const { requireAuth } = require("../middleware/auth");

const router = Router();
router.use(requireAuth);
router.post("/steps", addSteps);
router.post("/water", addWater);
router.get("/", listEntries);

module.exports = router;
