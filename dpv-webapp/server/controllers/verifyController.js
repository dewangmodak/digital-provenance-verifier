const VerificationReport = require("../models/VerificationReport");
const pool = require("../config/mysql");
const hammingDistance = require("../utils/hamming");
const { computeSimilarityScore } = require("../utils/similarity");
// 1. Import our new standard response formatters
const { successResponse, errorResponse } = require("../utils/responseHandler");

function getVerdict(score) {
  if (score >= 95) return "ORIGINAL / EXACT MATCH";
  if (score >= 85) return "VERY CLOSE MATCH";
  if (score >= 70) return "LIKELY MODIFIED COPY";
  if (score >= 50) return "POSSIBLY RELATED";
  return "NOT RELATED";
}

// 2. Add 'next' to the parameters
exports.verifyMedia = async (req, res, next) => {
  try {
    const { phash, dhash } = req.body;

    if (!phash || !dhash) {
      // 3. Use standard error response
      return errorResponse(res, 400, "Missing phash or dhash in request body");
    }

    const [rows] = await pool.query(
      "SELECT id, storage_url, phash, dhash FROM registered_media WHERE deleted_at IS NULL"
    );

    const matches = [];

    for (const media of rows) {
      if (!media.phash || !media.dhash) continue;

      const phashDist = hammingDistance(phash, media.phash);
      const dhashDist = hammingDistance(dhash, media.dhash);

      const similarityScore = computeSimilarityScore(phashDist, dhashDist);

      if (similarityScore >= 50) {
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

    await VerificationReport.create({
        user_id: req.user.id, 
        query_hashes: { phash, dhash },
        overall_verdict: overallVerdict,
        total_matches: matches.length,
        matches,
        verified_at: new Date(),
    });

    // 4. Use standard success response
    return successResponse(res, 200, "Verification completed successfully", {
      query_hashes: { phash, dhash },
      total_matches: matches.length,
      overall_verdict: overallVerdict,
      matches,
    });

  } catch (err) {
    // 5. Pass any server/DB crashes directly to the global error handler
    next(err);
  }
};

exports.getMyVerificationHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 🟢 NEW: Added { deleted_at: null } so users don't see deleted history
    const reports = await VerificationReport.find({ user_id: userId, deleted_at: null })
      .sort({ verified_at: -1 });

    return successResponse(res, 200, "History fetched successfully", {
      total: reports.length,
      history: reports,
    });
  } catch (err) {
    next(err); // Pass to global handler
  }
};