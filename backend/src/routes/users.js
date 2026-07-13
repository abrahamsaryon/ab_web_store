const router = require("express").Router();
const { getUsers, getUser, createUser, updateUser, deleteUser, toggleStatus } = require("../controllers/userController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

router.use(authMiddleware, adminMiddleware);

router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/", createUser);
router.put("/:id", updateUser);
router.patch("/:id/status", toggleStatus);
router.delete("/:id", deleteUser);

module.exports = router;
