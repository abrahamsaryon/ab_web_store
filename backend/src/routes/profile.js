const router = require("express").Router();
const { getProfile, updateProfile, changePassword } = require("../controllers/profileController");
const { authMiddleware } = require("../middleware/auth");

router.use(authMiddleware);
router.get("/", getProfile);
router.put("/", updateProfile);
router.put("/password", changePassword);

module.exports = router;
