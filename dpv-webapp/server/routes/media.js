const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const { uploadLimiter } = require("../middleware/rateLimiter");
const { registerMedia } = require("../controllers/mediaController");
const { verifyMedia } = require("../controllers/verifyController");

/**
 * @swagger
 * /api/v1/media/register:
 *   post:
 *     summary: Upload and register a new media file
 *     tags:
 *       - Media
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Media registered successfully
 *       400:
 *         description: File upload error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/register",
  auth,
  uploadLimiter,
  upload.single("file"),
  registerMedia
);

/**
 * @swagger
 * /api/v1/media/verify:
 *   post:
 *     summary: Verify if an image is AI-generated or a duplicate
 *     tags:
 *       - Media
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Media registered successfully
 *       400:
 *         description: File upload error
 *       401:
 *         description: Unauthorized
 */

router.post(
  "/verify", 
  auth, 
  upload.single("file"), // Keep this "file" to match register
  verifyMedia
);

module.exports = router;