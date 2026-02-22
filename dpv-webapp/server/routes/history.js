const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  getUserHistory,
  getAllVerificationReports,
  getFilteredVerificationReports,
} = require("../controllers/historyController");

/**
 * @swagger
 * /api/v1/history:
 *   get:
 *     summary: Get verification history for the logged-in user
 *     tags:
 *       - History
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User history fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", auth, getUserHistory);

/**
 * @swagger
 * /api/v1/history/all:
 *   get:
 *     summary: Get all verification reports (Admin only)
 *     tags:
 *       - History
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All reports fetched successfully
 *       403:
 *         description: Access denied. Requires admin role.
 */
router.get("/all", auth, authorize("admin"), getAllVerificationReports);

/**
 * @swagger
 * /api/v1/history/filter:
 *   get:
 *     summary: Get filtered and paginated verification reports (Admin only)
 *     tags:
 *       - History
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: min_score
 *         schema:
 *           type: integer
 *       - in: query
 *         name: max_score
 *         schema:
 *           type: integer
 *       - in: query
 *         name: verdict
 *         schema:
 *           type: string
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Filtered reports retrieved successfully
 *       403:
 *         description: Access denied. Requires admin role.
 */
router.get("/filter", auth, authorize("admin"), getFilteredVerificationReports);

module.exports = router;