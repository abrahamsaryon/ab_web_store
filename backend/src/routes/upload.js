const router = require("express").Router();
const { authMiddleware } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");
const { uploadImage } = require("../controllers/mediaController");

router.post("/", authMiddleware, upload.single("image"), uploadImage);

module.exports = router;
