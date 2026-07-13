const router = require("express").Router();
const { getReviews, createReview, deleteReview } = require("../controllers/reviewController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

router.get("/:productId", getReviews);
router.post("/:productId", authMiddleware, createReview);
router.delete("/:id", authMiddleware, deleteReview);

module.exports = router;
