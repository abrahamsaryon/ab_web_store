const pool = require("../config/db");

const createOrder = async (req, res) => {
  const { items, shipping_address, phone, payment_method = 'cash_on_delivery' } = req.body;
  if (!items?.length || !shipping_address)
    return res.status(400).json({ message: "Items and shipping address required" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let total = 0;
    for (const item of items) {
      const [[product]] = await conn.query("SELECT price, stock FROM products WHERE id = ?", [item.product_id]);
      if (!product) throw new Error(`Product ${item.product_id} not found`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for product ${item.product_id}`);
      total += product.price * item.quantity;
    }

    const [order] = await conn.query(
      "INSERT INTO orders (user_id, total_amount, shipping_address, phone, payment_method) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, total, shipping_address, phone, payment_method]
    );

    for (const item of items) {
      const [[product]] = await conn.query("SELECT price FROM products WHERE id = ?", [item.product_id]);
      await conn.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [order.insertId, item.product_id, item.quantity, product.price]
      );
      await conn.query("UPDATE products SET stock = stock - ? WHERE id = ?", [item.quantity, item.product_id]);
    }

    await conn.commit();
    res.status(201).json({ order_id: order.insertId, total });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
};

const getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      "SELECT o.*, GROUP_CONCAT(p.name SEPARATOR ', ') as products FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id LEFT JOIN products p ON oi.product_id = p.id WHERE o.user_id = ? GROUP BY o.id ORDER BY o.created_at DESC",
      [req.user.id]
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const [[order]] = await pool.query("SELECT * FROM orders WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const [items] = await pool.query(
      "SELECT oi.*, p.name, p.image_url FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?",
      [req.params.id]
    );
    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      "SELECT o.*, u.name as customer_name, u.email FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC"
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [req.body.status, req.params.id]);
    res.json({ message: "Order status updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// WhatsApp order: create a pending record then return the WhatsApp URL
const createWhatsappOrder = async (req, res) => {
  const { product_id, quantity = 1, shipping_address = 'To be confirmed via WhatsApp', phone = '' } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[product]] = await conn.query("SELECT * FROM products WHERE id = ?", [product_id]);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock < quantity) return res.status(400).json({ message: "Insufficient stock" });

    const total = product.price * quantity;
    const [order] = await conn.query(
      "INSERT INTO orders (user_id, total_amount, shipping_address, phone, payment_method, status) VALUES (?, ?, ?, ?, 'whatsapp', 'pending')",
      [req.user.id, total, shipping_address, phone]
    );
    await conn.query(
      "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
      [order.insertId, product_id, quantity, product.price]
    );
    await conn.query("UPDATE products SET stock = stock - ? WHERE id = ?", [quantity, product_id]);
    await conn.commit();

    const waNumber = (product.whatsapp_number || req.body.default_number || '').replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Hi, I'd like to order:\n*${product.name}* x${quantity}\nPrice: ${Number(total).toLocaleString()} RWF\nOrder ID: #${order.insertId}\nPlease confirm my order.`
    );
    res.json({ order_id: order.insertId, whatsapp_url: `https://wa.me/${waNumber}?text=${msg}` });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
};

const getAdminStats = async (req, res) => {
  try {
    const [[{ total_products }]] = await pool.query("SELECT COUNT(*) as total_products FROM products");
    const [orders] = await pool.query("SELECT id, user_id, total_amount, status, created_at FROM orders");
    const revenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);
    const customers = new Set(orders.map((o) => o.user_id)).size;

    const statusCounts = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach((o) => { if (statusCounts[o.status] !== undefined) statusCounts[o.status]++; });

    // Revenue per day for last 30 days
    const [dailyRows] = await pool.query(
      `SELECT DATE(created_at) as date, SUM(total_amount) as revenue
       FROM orders
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    // Fill in missing days with 0
    const dailyMap = {};
    dailyRows.forEach((r) => { dailyMap[r.date.toISOString().slice(0, 10)] = Number(r.revenue); });
    const daily = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      daily.push({ date: key, revenue: dailyMap[key] || 0 });
    }

    res.json({
      products: total_products,
      orders: orders.length,
      revenue,
      customers,
      statusCounts,
      daily,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, createWhatsappOrder, getAdminStats };
