const { Router } = require("express");
const { login, me } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

const router = Router();
router.post("/login", login);
router.get("/me", requireAuth, me);

module.exports = router;
