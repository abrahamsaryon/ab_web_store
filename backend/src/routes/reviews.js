const router = require("express").Router();
const {
  getReviews, getAllReviews, createReview,
  updateReviewStatus, deleteReview, canReview
} = require("../controllers/reviewController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

// Public
router.get("/product/:productId", getReviews);

// Authenticated
router.get("/can-review/:productId", authMiddleware, canReview);
router.post("/product/:productId", authMiddleware, createReview);
router.delete("/:id", authMiddleware, deleteReview);

// Admin only
router.get("/", authMiddleware, adminMiddleware, getAllReviews);
router.put("/:id/status", authMiddleware, adminMiddleware, updateReviewStatus);

module.exports = router;
