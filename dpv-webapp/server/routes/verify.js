const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  verifyMedia,
  getMyVerificationHistory,
} = require("../controllers/verifyController");

/**
 * @swagger
 * /api/v1/verify:
 *   post:
 *     summary: Verify media using phash and dhash
 *     tags:
 *       - Verification
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phash
 *               - dhash
 *             properties:
 *               phash:
 *                 type: string
 *               dhash:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification completed successfully
 *       400:
 *         description: Missing hashes in request body
 *       401:
 *         description: Unauthorized
 */
router.post("/", auth, verifyMedia);

/**
 * @swagger
 * /api/v1/verify/my-history:
 *   get:
 *     summary: Get logged-in user's verification history
 *     tags:
 *       - Verification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/my-history", auth, getMyVerificationHistory);

module.exports = router;