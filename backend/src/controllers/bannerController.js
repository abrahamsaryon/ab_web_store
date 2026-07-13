const pool = require("../config/db");
const { cloudinary } = require("../config/cloudinary");

const getBanners = async (req, res) => {
  const onlyActive = req.query.active === "1";
  const [rows] = await pool.query(
    `SELECT * FROM banners ${onlyActive ? "WHERE active = 1" : ""} ORDER BY sort_order ASC, id ASC`
  );
  res.json(rows);
};

const createBanner = async (req, res) => {
  const { title, subtitle, button_text = "Shop Now", button_link = "/products", image_url, public_id, sort_order = 0 } = req.body;
  if (!image_url) return res.status(400).json({ message: "Image is required" });
  const [[{ cnt }]] = await pool.query("SELECT COUNT(*) as cnt FROM banners");
  const [result] = await pool.query(
    "INSERT INTO banners (title, subtitle, button_text, button_link, image_url, public_id, sort_order) VALUES (?,?,?,?,?,?,?)",
    [title, subtitle, button_text, button_link, image_url, public_id || null, cnt]
  );
  res.status(201).json({ id: result.insertId });
};

const updateBanner = async (req, res) => {
  const { title, subtitle, button_text, button_link, image_url, public_id, sort_order, active } = req.body;
  await pool.query(
    "UPDATE banners SET title=?, subtitle=?, button_text=?, button_link=?, image_url=?, public_id=?, sort_order=?, active=? WHERE id=?",
    [title, subtitle, button_text, button_link, image_url, public_id || null, sort_order, active ? 1 : 0, req.params.id]
  );
  res.json({ message: "Banner updated" });
};

const deleteBanner = async (req, res) => {
  const [[banner]] = await pool.query("SELECT public_id FROM banners WHERE id = ?", [req.params.id]);
  if (banner?.public_id) await cloudinary.uploader.destroy(banner.public_id).catch(() => {});
  await pool.query("DELETE FROM banners WHERE id = ?", [req.params.id]);
  res.json({ message: "Banner deleted" });
};

module.exports = { getBanners, createBanner, updateBanner, deleteBanner };
