const axios = require("axios");
const path = require("path");
const VerificationReport = require("../models/VerificationReport");
const pool = require("../config/mysql");
const hammingDistance = require("../utils/hamming");
const { computeSimilarityScore } = require("../utils/similarity");
const { successResponse, errorResponse } = require("../utils/responseHandler");

function getVerdict(score) {
  if (score === 100) return "ORIGINAL / EXACT MATCH";
  if (score >= 92) return "VERY CLOSE MATCH"; // Slight crop or color change
  if (score >= 85) return "POSSIBLY MODIFIED COPY"; // Heavy filter or resize
  return "NOT RELATED"; 
}

exports.verifyMedia = async (req, res, next) => {
  try {
    // 1. MUST have a file to perform Deepfake check
    if (!req.file) {
      return errorResponse(res, 400, "Please upload an image file for verification");
    }

    const absolutePath = path.resolve(req.file.path);

    // 2.Get Deepfake Integrity Check from Python
    const integrityResponse = await axios.post(
      "http://localhost:8000/ai/check-image-integrity-local",
      { file_path: absolutePath }
    );
    
    const aiLabel = integrityResponse.data.label;
    const aiScore = integrityResponse.data.score;
    
    // Convert decimal to integer (e.g., 0.95 -> 95)
    const confidencePercentage = Math.round(aiScore * 100);

    // DEMO-DAY FAILSAFE: 
    // If the AI is not at least 70% confident, we flag it as 'UNCERTAIN' so we never look foolish.
    let finalLabel = aiLabel.toLowerCase();
    if (confidencePercentage < 70) {
        finalLabel = "uncertain - requires manual review";
    }

    const aiDetection = {
      is_ai_generated: finalLabel.includes("fake") || finalLabel.includes("ai"),
      confidence_score: confidencePercentage + "%",
      raw_label: finalLabel
    };

    // 3. 🔍 Get Hashes from Python
    const hashResponse = await axios.post(
      "http://localhost:8000/ai/generate-hashes-local",
      { file_path: absolutePath }
    );
    const { phash, dhash } = hashResponse.data;

    // 4. 🕵️ Run the MySQL Provenance DB Match
    const [rows] = await pool.query(
      "SELECT id, storage_url, phash, dhash FROM registered_media WHERE deleted_at IS NULL"
    );

    const matches = [];

    for (const media of rows) {
      if (!media.phash || !media.dhash) continue;

      const phashDist = hammingDistance(phash, media.phash);
      const dhashDist = hammingDistance(dhash, media.dhash);

      const similarityScore = computeSimilarityScore(phashDist, dhashDist);

      // ONLY push into the array if the similarity is 85% or higher
      if (similarityScore >= 85) {
        matches.push({
          media_id: media.id,
          storage_url: media.storage_url,
          phash_distance: phashDist,
          dhash_distance: dhashDist,
          similarity_score: similarityScore,
          verdict: getVerdict(similarityScore),
        });
      }
    }

    matches.sort((a, b) => b.similarity_score - a.similarity_score);

    const overallVerdict =
      matches.length > 0
        ? getVerdict(matches[0].similarity_score)
        : "NO MATCH FOUND";

    // 5. 📝 Save Complete Report to MongoDB
    await VerificationReport.create({
        user_id: req.user.id, 
        query_hashes: { phash, dhash },
        ai_detection: aiDetection, // Saving the deepfake info to DB!
        overall_verdict: overallVerdict,
        total_matches: matches.length,
        matches,
        verified_at: new Date(),
    });

    // 6. Return standard success response
    return successResponse(res, 200, "Verification completed successfully", {
      ai_detection: aiDetection, // Sent to Frontend
      query_hashes: { phash, dhash },
      total_matches: matches.length,
      overall_verdict: overallVerdict,
      matches,
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