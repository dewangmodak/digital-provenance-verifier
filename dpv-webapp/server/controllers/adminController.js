// server/controllers/adminController.js
const pool = require("../config/mysql");
const VerificationReport = require("../models/VerificationReport");
const { successResponse } = require("../utils/responseHandler");

// 1. Get Platform Analytics
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Count total users in MySQL
    const [userRows] = await pool.query("SELECT COUNT(*) as total FROM users");
    const totalUsers = userRows[0].total;

    // Count verifications in MongoDB
    const totalVerifications = await VerificationReport.countDocuments({ deleted_at: null });

    // Count Deepfakes caught
    const aiGenerated = await VerificationReport.countDocuments({
      "ai_detection.is_ai_generated": true,
      deleted_at: null
    });

    return successResponse(res, 200, "Admin stats fetched", {
      totalUsers,
      totalVerifications,
      aiGenerated
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get Global Ledger (Everyone's history)
exports.getAllHistory = async (req, res, next) => {
   try {
     const reports = await VerificationReport.find({ deleted_at: null })
        .sort({ verified_at: -1 }); // Newest first
        
     return successResponse(res, 200, "Global history fetched", { 
         history: reports 
     });
   } catch (error) {
     next(error);
   }
};

// 3. Get All Registered Users
exports.getAllUsers = async (req, res, next) => {
  try {
    // 💡 FIXED: Removed 'name' column to prevent the 500 error
    const [users] = await pool.query(
      "SELECT id, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    return successResponse(res, 200, "Users fetched successfully", { users });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    
    if (targetUserId == req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot delete your own admin account!" 
      });
    }

    const mongoResult = await VerificationReport.deleteMany({ user_id: targetUserId });
    console.log(`🧹 MongoDB Cleanup: Removed ${mongoResult.deletedCount} reports.`);

    
    const [mysqlResult] = await pool.query("DELETE FROM users WHERE id = ?", [targetUserId]);

    if (mysqlResult.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ 
      success: true, 
      message: `User, their registered art, and ${mongoResult.deletedCount} reports permanently deleted.` 
    });
  } catch (error) {
    next(error);
  }
};