const mongoose = require("mongoose");

const VerificationReportSchema = new mongoose.Schema({
  // Keeping your existing Number type for user_id
  user_id: { type: Number, required: true },
  
  // 🖼️ NEW: Stores the URL of the image being verified (Query Image)
  file_url: { type: String },

  query_hashes: {
    phash: { type: String, required: true },
    dhash: { type: String, required: true },
  },
  
  // 🤖 AI Deepfake Detection Support
  ai_detection: {
    is_ai_generated: { type: Boolean, required: true },
    confidence_score: { type: String, required: true },
    raw_label: { type: String, required: true }
  },

  overall_verdict: { type: String, required: true },
  total_matches: { type: Number, required: true },

  // 🕵️‍♂️ UPDATED: Renamed from 'matches' to 'similarity_details' 
  // and added 'filename' and 'score' to match the Controller and Dashboard Modal
  similarity_details: [
    {
      media_id: { type: Number },
      storage_url: { type: String },
      filename: { type: String },
      score: { type: Number },
      verdict: { type: String },
      phash_distance: { type: Number },
      dhash_distance: { type: Number }
    },
  ],

  verified_at: { type: Date, default: Date.now },
  
  // 🟢 Soft Delete Support
  deleted_at: { type: Date, default: null } 
});

// Indexes for fast querying (Kept exactly as you had them)
VerificationReportSchema.index({ user_id: 1, verified_at: -1 });
VerificationReportSchema.index({ overall_verdict: 1 });
VerificationReportSchema.index({ deleted_at: 1 });

module.exports = mongoose.model(
  "VerificationReport",
  VerificationReportSchema
);