const router = require("express").Router();
const { getBanners, createBanner, updateBanner, deleteBanner } = require("../controllers/bannerController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

router.get("/", getBanners);
router.post("/", authMiddleware, adminMiddleware, createBanner);
router.put("/:id", authMiddleware, adminMiddleware, updateBanner);
router.delete("/:id", authMiddleware, adminMiddleware, deleteBanner);

module.exports = router;
