const { Router } = require("express");
const { getSettings, updateSettings } = require("../controllers/settingsController");
const { requireAuth } = require("../middleware/auth");

const router = Router();
router.use(requireAuth);
router.get("/", getSettings);
router.put("/", updateSettings);

module.exports = router;
