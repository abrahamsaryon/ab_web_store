const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const getProfile = async (req, res) => {
  try {
    const [[user]] = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  const { name, email } = req.body;
  try {
    await pool.query("UPDATE users SET name=?, email=? WHERE id=?", [name, email, req.user.id]);
    res.json({ message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: "Both current and new password are required" });
  if (newPassword.length < 6)
    return res.status(400).json({ message: "New password must be at least 6 characters" });
  try {
    const [[user]] = await pool.query("SELECT password FROM users WHERE id = ?", [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ message: "Current password is incorrect" });
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password=? WHERE id=?", [hashed, req.user.id]);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProfile, updateProfile, changePassword };
