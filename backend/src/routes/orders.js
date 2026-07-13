const router = require("express").Router();
const { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, createWhatsappOrder } = require("../controllers/orderController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

router.post("/", authMiddleware, createOrder);
router.post("/whatsapp", authMiddleware, createWhatsappOrder);
router.get("/my", authMiddleware, getMyOrders);
router.get("/:id", authMiddleware, getOrderById);
router.get("/", authMiddleware, adminMiddleware, getAllOrders);
router.put("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);

module.exports = router;
