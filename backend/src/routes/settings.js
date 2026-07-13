const router = require("express").Router();
const { getSettings, updateSettings } = require("../controllers/settingsController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

router.get("/", getSettings);
router.put("/", authMiddleware, adminMiddleware, updateSettings);

module.exports = router;
