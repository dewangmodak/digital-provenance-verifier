const mongoose = require("mongoose");

const VerificationReportSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  query_hashes: {
    phash: { type: String, required: true },
    dhash: { type: String, required: true },
  },
  overall_verdict: { type: String, required: true },
  total_matches: { type: Number, required: true },
  matches: [
    {
      media_id: Number,
      storage_url: String,
      phash_distance: Number,
      dhash_distance: Number,
      similarity_score: Number,
      verdict: String,
    },
  ],
  verified_at: { type: Date, default: Date.now },
  
  // 🟢 NEW: Soft Delete Support
  deleted_at: { type: Date, default: null } 
});

VerificationReportSchema.index({ user_id: 1, verified_at: -1 });

VerificationReportSchema.index({ overall_verdict: 1 });

VerificationReportSchema.index({ deleted_at: 1 });

module.exports = mongoose.model(
  "VerificationReport",
  VerificationReportSchema
);