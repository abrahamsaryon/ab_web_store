const pool = require("../config/db");

// Public: only approved reviews
const getReviews = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.name as user_name, u.avatar as user_avatar
       FROM reviews r JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.status = 'approved'
       ORDER BY r.created_at DESC`,
      [req.params.productId]
    );
    const [[{ avg_rating }]] = await pool.query(
      "SELECT AVG(rating) as avg_rating FROM reviews WHERE product_id = ? AND status = 'approved'",
      [req.params.productId]
    );
    res.json({ reviews: rows, avg_rating: avg_rating ? Number(avg_rating).toFixed(1) : null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: all reviews with filters
const getAllReviews = async (req, res) => {
  const { status } = req.query;
  try {
    let query = `SELECT r.*, u.name as user_name, p.name as product_name
                 FROM reviews r
                 JOIN users u ON r.user_id = u.id
                 JOIN products p ON r.product_id = p.id`;
    const params = [];
    if (status) { query += " WHERE r.status = ?"; params.push(status); }
    query += " ORDER BY r.created_at DESC";
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Customer: submit review (only if purchased & delivered)
const createReview = async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5)
    return res.status(400).json({ message: "Rating must be between 1 and 5" });

  try {
    // Check if user has a delivered order containing this product
    const [orders] = await pool.query(
      `SELECT oi.id FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'
       LIMIT 1`,
      [req.user.id, req.params.productId]
    );

    if (!orders.length)
      return res.status(403).json({
        message: "You can only review products you have purchased and received."
      });

    const verified = 1;

    // Check if already reviewed
    const [existing] = await pool.query(
      "SELECT id FROM reviews WHERE product_id = ? AND user_id = ?",
      [req.params.productId, req.user.id]
    );

    if (existing.length) {
      // Update existing review, reset to pending
      await pool.query(
        "UPDATE reviews SET rating=?, comment=?, status='pending', verified_purchase=? WHERE product_id=? AND user_id=?",
        [rating, comment, verified, req.params.productId, req.user.id]
      );
    } else {
      await pool.query(
        "INSERT INTO reviews (product_id, user_id, rating, comment, status, verified_purchase) VALUES (?, ?, ?, ?, 'pending', ?)",
        [req.params.productId, req.user.id, rating, comment, verified]
      );
    }

    res.status(201).json({ message: "Review submitted and pending approval." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: approve or reject review
const updateReviewStatus = async (req, res) => {
  const { status } = req.body;
  if (!["approved", "rejected", "pending"].includes(status))
    return res.status(400).json({ message: "Invalid status" });
  try {
    await pool.query("UPDATE reviews SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ message: `Review ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete review (admin or owner)
const deleteReview = async (req, res) => {
  try {
    const [[review]] = await pool.query("SELECT user_id FROM reviews WHERE id = ?", [req.params.id]);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.user_id !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });
    await pool.query("DELETE FROM reviews WHERE id = ?", [req.params.id]);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Check if current user can review this product
const canReview = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT oi.id FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'
       LIMIT 1`,
      [req.user.id, req.params.productId]
    );
    const [existing] = await pool.query(
      "SELECT id, status FROM reviews WHERE product_id = ? AND user_id = ?",
      [req.params.productId, req.user.id]
    );
    res.json({
      can_review: orders.length > 0,
      already_reviewed: existing.length > 0,
      review_status: existing[0]?.status || null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getReviews, getAllReviews, createReview, updateReviewStatus, deleteReview, canReview };
