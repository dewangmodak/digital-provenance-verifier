const axios = require("axios");
const path = require("path");
const VerificationReport = require("../models/VerificationReport");
const pool = require("../config/mysql");
const hammingDistance = require("../utils/hamming");
const { computeSimilarityScore } = require("../utils/similarity");
const { successResponse, errorResponse } = require("../utils/responseHandler");

function getVerdict(score) {
  if (score === 100) return "ORIGINAL / EXACT MATCH";
  if (score >= 92) return "VERY CLOSE MATCH"; 
  if (score >= 85) return "POSSIBLY MODIFIED COPY"; 
  return "NOT RELATED"; 
}

exports.verifyMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, "Please upload an image file for verification");
    }

    const absolutePath = path.resolve(req.file.path);
    // Create the URL for the query image so the frontend can display it
    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    // 1. Get Deepfake Integrity Check from Python
    const integrityResponse = await axios.post(
      "http://localhost:8000/ai/check-image-integrity-local",
      { file_path: absolutePath }
    );
    
    const aiLabel = integrityResponse.data.label;
    const aiScore = integrityResponse.data.score;
    const confidencePercentage = Math.round(aiScore * 100);

    let finalLabel = aiLabel.toLowerCase();
    if (confidencePercentage < 70) {
        finalLabel = "uncertain - requires manual review";
    }

    const aiDetection = {
      is_ai_generated: finalLabel.includes("fake") || finalLabel.includes("ai"),
      confidence_score: confidencePercentage + "%",
      raw_label: finalLabel
    };

    // 2. 🔍 Get Hashes from Python
    const hashResponse = await axios.post(
      "http://localhost:8000/ai/generate-hashes-local",
      { file_path: absolutePath }
    );
    const { phash, dhash } = hashResponse.data;

    // 3. 🕵️ Run the MySQL Provenance DB Match
    const [rows] = await pool.query(
      "SELECT id, storage_url, original_filename, phash, dhash FROM registered_media WHERE deleted_at IS NULL"
    );

    const matches = [];

    for (const media of rows) {
      if (!media.phash || !media.dhash) continue;

      const phashDist = hammingDistance(phash, media.phash);
      const dhashDist = hammingDistance(dhash, media.dhash);
      const similarityScore = computeSimilarityScore(phashDist, dhashDist);

      if (similarityScore >= 85) {
        matches.push({
          media_id: media.id,
          storage_url: media.storage_url,
          filename: media.original_filename,
          score: similarityScore,            
          verdict: getVerdict(similarityScore),
        });
      }
    }

    matches.sort((a, b) => b.score - a.score);

    const overallVerdict =
      matches.length > 0
        ? getVerdict(matches[0].score)
        : "NO MATCH FOUND";

    // 4. 📝 Save Complete Report to MongoDB
    await VerificationReport.create({
        user_id: req.user.id, 
        file_url: fileUrl, 
        query_hashes: { phash, dhash },
        ai_detection: aiDetection,
        overall_verdict: overallVerdict,
        total_matches: matches.length,
        similarity_details: matches, 
        verified_at: new Date(),
    });

    return successResponse(res, 200, "Verification completed successfully", {
      ai_detection: aiDetection,
      file_url: fileUrl,
      total_matches: matches.length,
      overall_verdict: overallVerdict,
      similarity_details: matches,
    });

  } catch (err) {
    next(err);
  }
};

exports.getMyVerificationHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reports = await VerificationReport.find({ user_id: userId, deleted_at: null })
      .sort({ verified_at: -1 });

    return successResponse(res, 200, "History fetched successfully", {
      total: reports.length,
      history: reports,
    });
  } catch (err) {
    next(err); 
  }
};

exports.deleteVerificationReport = async (req, res, next) => {
  try {
    const reportId = req.params.id;
    const userId = req.user.id;

    // Soft delete: Find the report and set 'deleted_at' to right now
    const report = await VerificationReport.findOneAndUpdate(
      { _id: reportId, user_id: userId, deleted_at: null },
      { deleted_at: new Date() },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found or unauthorized" });
    }

    return res.status(200).json({ success: true, message: "Report deleted successfully" });
  } catch (err) {
    next(err);
  }
};