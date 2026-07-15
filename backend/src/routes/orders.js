const router = require("express").Router();
const { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, createWhatsappOrder, getAdminStats } = require("../controllers/orderController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

router.post("/", authMiddleware, createOrder);
router.post("/whatsapp", authMiddleware, createWhatsappOrder);
router.get("/stats", authMiddleware, adminMiddleware, getAdminStats);
router.get("/my", authMiddleware, getMyOrders);
router.get("/", authMiddleware, adminMiddleware, getAllOrders);
router.get("/:id", authMiddleware, getOrderById);
router.put("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);

module.exports = router;
