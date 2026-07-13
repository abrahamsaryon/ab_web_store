const pool = require("../config/db");

const getProducts = async (req, res) => {
  const { category, search, page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;
  let query = `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1`;
  const params = [];

  if (category) { query += " AND p.category_id = ?"; params.push(category); }
  if (search) { query += " AND (p.name LIKE ? OR p.description LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }

  query += " LIMIT ? OFFSET ?";
  params.push(Number(limit), Number(offset));

  try {
    const [products] = await pool.query(query, params);
    let countQuery = "SELECT COUNT(*) as total FROM products p WHERE 1=1";
  const countParams = [];
  if (category) { countQuery += " AND p.category_id = ?"; countParams.push(category); }
  if (search) { countQuery += " AND (p.name LIKE ? OR p.description LIKE ?)"; countParams.push(`%${search}%`, `%${search}%`); }
  const [[{ total }]] = await pool.query(countQuery, countParams);
    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: "Product not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createProduct = async (req, res) => {
  const { name, description, price, stock, image_url, category_id } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, price, stock, image_url, category_id]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProduct = async (req, res) => {
  const { name, description, price, stock, image_url, category_id } = req.body;
  try {
    await pool.query(
      "UPDATE products SET name=?, description=?, price=?, stock=?, image_url=?, category_id=? WHERE id=?",
      [name, description, price, stock, image_url, category_id, req.params.id]
    );
    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
