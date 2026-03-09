// server/routes/admin.js
const express = require("express");
const router = express.Router();

// Import middlewares
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/adminAuth");

// Import controller
const { 
  getDashboardStats, 
  getAllHistory, 
  getAllUsers, 
  deleteUser 
} = require("../controllers/adminController");

// 🛡️ Apply BOTH middlewares to all routes in this file
router.use(auth, isAdmin); 

// Routes:
// GET /api/v1/admin/stats
router.get("/stats", getDashboardStats);

// GET /api/v1/admin/history
router.get("/history", getAllHistory);

// GET /api/v1/admin/users (List everyone)
router.get("/users", getAllUsers);

// DELETE /api/v1/admin/users/:id (Ban hammer)
router.delete("/users/:id", deleteUser);

module.exports = router;