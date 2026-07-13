const pool = require("../config/db");
const { cloudinary } = require("../config/cloudinary");

// Upload image file (via multer) or save URL directly
const uploadImage = async (req, res) => {
  const folder = req.body.folder || req.query.folder || "ab_webstore/general";
  try {
    let url, public_id;
    if (req.file) {
      url = req.file.path;
      public_id = req.file.filename;
    } else if (req.body.url) {
      const result = await cloudinary.uploader.upload(req.body.url, { folder });
      url = result.secure_url;
      public_id = result.public_id;
    } else {
      return res.status(400).json({ message: "No file or URL provided" });
    }
    res.json({ url, public_id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all images for a product
const getProductImages = async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC",
    [req.params.productId]
  );
  res.json(rows);
};

// Add image to product
const addProductImage = async (req, res) => {
  const { url, public_id, is_primary = 0 } = req.body;
  const { productId } = req.params;
  try {
    if (is_primary) {
      await pool.query("UPDATE product_images SET is_primary = 0 WHERE product_id = ?", [productId]);
    }
    const [[{ cnt }]] = await pool.query("SELECT COUNT(*) as cnt FROM product_images WHERE product_id = ?", [productId]);
    const [result] = await pool.query(
      "INSERT INTO product_images (product_id, url, public_id, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)",
      [productId, url, public_id || null, is_primary ? 1 : (cnt === 0 ? 1 : 0), cnt]
    );
    // Sync primary image to products table
    if (is_primary || cnt === 0) {
      await pool.query("UPDATE products SET image_url = ? WHERE id = ?", [url, productId]);
    }
    res.status(201).json({ id: result.insertId, url, public_id, is_primary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Set primary image
const setPrimaryImage = async (req, res) => {
  const { productId, imageId } = req.params;
  try {
    await pool.query("UPDATE product_images SET is_primary = 0 WHERE product_id = ?", [productId]);
    await pool.query("UPDATE product_images SET is_primary = 1 WHERE id = ? AND product_id = ?", [imageId, productId]);
    const [[img]] = await pool.query("SELECT url FROM product_images WHERE id = ?", [imageId]);
    await pool.query("UPDATE products SET image_url = ? WHERE id = ?", [img.url, productId]);
    res.json({ message: "Primary image updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete image
const deleteProductImage = async (req, res) => {
  try {
    const [[img]] = await pool.query("SELECT * FROM product_images WHERE id = ?", [req.params.imageId]);
    if (!img) return res.status(404).json({ message: "Image not found" });
    if (img.public_id) await cloudinary.uploader.destroy(img.public_id).catch(() => {});
    await pool.query("DELETE FROM product_images WHERE id = ?", [req.params.imageId]);
    // If deleted was primary, promote next
    if (img.is_primary) {
      const [[next]] = await pool.query("SELECT * FROM product_images WHERE product_id = ? LIMIT 1", [img.product_id]);
      if (next) {
        await pool.query("UPDATE product_images SET is_primary = 1 WHERE id = ?", [next.id]);
        await pool.query("UPDATE products SET image_url = ? WHERE id = ?", [next.url, img.product_id]);
      }
    }
    res.json({ message: "Image deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Variants ---
const getVariants = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM product_variants WHERE product_id = ?", [req.params.productId]);
  res.json(rows);
};

const addVariant = async (req, res) => {
  const { name, value, price_modifier = 0, stock = 0, image_url = null } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO product_variants (product_id, name, value, price_modifier, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)",
      [req.params.productId, name, value, price_modifier, stock, image_url]
    );
    res.status(201).json({ id: result.insertId, name, value, price_modifier, stock, image_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateVariant = async (req, res) => {
  const { name, value, price_modifier, stock, image_url } = req.body;
  try {
    await pool.query(
      "UPDATE product_variants SET name=?, value=?, price_modifier=?, stock=?, image_url=? WHERE id=? AND product_id=?",
      [name, value, price_modifier, stock, image_url, req.params.variantId, req.params.productId]
    );
    res.json({ message: "Variant updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteVariant = async (req, res) => {
  try {
    await pool.query("DELETE FROM product_variants WHERE id = ? AND product_id = ?", [req.params.variantId, req.params.productId]);
    res.json({ message: "Variant deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { uploadImage, getProductImages, addProductImage, setPrimaryImage, deleteProductImage, getVariants, addVariant, updateVariant, deleteVariant };
