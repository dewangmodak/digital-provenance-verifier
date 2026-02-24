const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload"); // 👈 1. IMPORT MULTER HERE
const {
  verifyMedia,
  getMyVerificationHistory,
} = require("../controllers/verifyController");

/**
 * @swagger
 * /api/v1/verify:
 * post:
 * summary: Verify media using phash and dhash
 * tags:
 * - Verification
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * multipart/form-data:
 * schema:
 * type: object
 * properties:
 * image:
 * type: string
 * format: binary
 * responses:
 * 200:
 * description: Verification completed successfully
 * 400:
 * description: Missing file or bad request
 * 401:
 * description: Unauthorized
 */
// 👇 2. ADD upload.single("image") RIGHT HERE!
router.post("/", auth, upload.single("image"), verifyMedia);

/**
 * @swagger
 * /api/v1/verify/my-history:
 * get:
 * summary: Get logged-in user's verification history
 * tags:
 * - Verification
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Verification history retrieved successfully
 * 401:
 * description: Unauthorized
 */
router.get("/my-history", auth, getMyVerificationHistory);

module.exports = router;