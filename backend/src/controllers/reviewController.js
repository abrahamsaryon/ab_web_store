const pool = require("../config/db");

const getReviews = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.name as user_name, u.avatar as user_avatar
       FROM reviews r JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? ORDER BY r.created_at DESC`,
      [req.params.productId]
    );
    const [[{ avg_rating }]] = await pool.query(
      "SELECT AVG(rating) as avg_rating FROM reviews WHERE product_id = ?",
      [req.params.productId]
    );
    res.json({ reviews: rows, avg_rating: avg_rating ? Number(avg_rating).toFixed(1) : null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createReview = async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5)
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  try {
    await pool.query(
      "INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating=?, comment=?",
      [req.params.productId, req.user.id, rating, comment, rating, comment]
    );
    res.status(201).json({ message: "Review submitted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    await pool.query("DELETE FROM reviews WHERE id = ? AND (user_id = ? OR ?)", [req.params.id, req.user.id, req.user.role === "admin"]);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getReviews, createReview, deleteReview };
