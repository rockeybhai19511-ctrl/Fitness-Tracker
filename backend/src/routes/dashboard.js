const { Router } = require("express");
const { getMetrics } = require("../controllers/dashboardController");
const { requireAuth } = require("../middleware/auth");

const router = Router();
router.get("/metrics", requireAuth, getMetrics);

module.exports = router;
