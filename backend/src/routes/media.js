const router = require("express").Router();
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");
const {
  uploadImage, getProductImages, addProductImage, setPrimaryImage, deleteProductImage,
  getVariants, addVariant, updateVariant, deleteVariant,
} = require("../controllers/mediaController");

const admin = [authMiddleware, adminMiddleware];

// Image upload (file or URL)
router.post("/upload", ...admin, upload.single("image"), uploadImage);

// Product images
router.get("/:productId/images", getProductImages);
router.post("/:productId/images", ...admin, addProductImage);
router.put("/:productId/images/:imageId/primary", ...admin, setPrimaryImage);
router.delete("/:productId/images/:imageId", ...admin, deleteProductImage);

// Product variants
router.get("/:productId/variants", getVariants);
router.post("/:productId/variants", ...admin, addVariant);
router.put("/:productId/variants/:variantId", ...admin, updateVariant);
router.delete("/:productId/variants/:variantId", ...admin, deleteVariant);

module.exports = router;
