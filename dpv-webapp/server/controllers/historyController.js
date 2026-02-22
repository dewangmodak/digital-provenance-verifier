const VerificationReport = require("../models/VerificationReport");
const { successResponse } = require("../utils/responseHandler"); // 👈 1. Import formatter

// User: Fetch history for the logged-in user only
exports.getUserHistory = async (req, res, next) => { // 👈 2. Added next
  try {
    // 👈 3. Added deleted_at: null filter
    const reports = await VerificationReport.find({ user_id: req.user.id, deleted_at: null })
      .sort({ verified_at: -1 });
      
    return successResponse(res, 200, "User history fetched successfully", { 
      total: reports.length, 
      reports 
    });
  } catch (err) {
    next(err); // 👈 4. Pass to global handler
  }
};

// Admin: Fetch all reports
exports.getAllVerificationReports = async (req, res, next) => {
  try {
    // 👈 Added deleted_at: null filter
    const reports = await VerificationReport.find({ deleted_at: null })
      .sort({ verified_at: -1 });
      
    return successResponse(res, 200, "All reports fetched successfully", { 
      total: reports.length, 
      reports 
    });
  } catch (err) {
    next(err); 
  }
};

// Admin: Filtered History with Pagination
exports.getFilteredVerificationReports = async (req, res, next) => {
  try {
    const { min_score, max_score, verdict, start_date, end_date, page = 1, limit = 10 } = req.query;

    // 👈 Base filter MUST include soft delete check
    let filter = { deleted_at: null }; 

    // Filter by similarity_score inside matches array using $elemMatch
    if (min_score || max_score) {
      filter.matches = { $elemMatch: {} };
      if (min_score) filter.matches.$elemMatch.similarity_score = { $gte: parseInt(min_score) };
      if (max_score) filter.matches.$elemMatch.similarity_score = { ...filter.matches.$elemMatch.similarity_score, $lte: parseInt(max_score) };
    }

    // Filter by exact overall_verdict
    if (verdict) {
      filter.overall_verdict = verdict;
    }

    // Filter by verified_at
    if (start_date || end_date) {
      filter.verified_at = {};
      if (start_date) filter.verified_at.$gte = new Date(start_date);
      if (end_date) filter.verified_at.$lte = new Date(end_date);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await VerificationReport.find(filter)
      .sort({ verified_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalReports = await VerificationReport.countDocuments(filter);

    return successResponse(res, 200, "Filtered reports fetched successfully", {
      total: totalReports,
      page: parseInt(page),
      limit: parseInt(limit),
      reports,
    });
  } catch (err) {
    next(err); 
  }
};