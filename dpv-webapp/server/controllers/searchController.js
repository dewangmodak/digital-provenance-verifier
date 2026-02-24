const axios = require("axios");
const Media = require("../models/Media");
const hammingDistance = require("../utils/hamming");

exports.searchSimilarMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    // Generate hashes via AI
    const aiResponse = await axios.post(
      "http://localhost:8000/ai/generate-hashes",
      { file_url: fileUrl }
    );

    const { phash, dhash } = aiResponse.data;

    // Fetch all stored media
    const [rows] = await Media.getAllHashes();

    const matches = [];

    // Compare hashes
    for (const media of rows) {
      const pDist = hammingDistance(phash, media.phash);
      const dDist = hammingDistance(dhash, media.dhash);

      const score = Math.min(pDist, dDist);

      if (score <= 10) {
        matches.push({
          media_id: media.id,
          storage_url: media.storage_url,
          phash_distance: pDist,
          dhash_distance: dDist,
          similarity_score: score,
        });
      }
    }

    //Sort by similarity
    matches.sort((a, b) => a.similarity_score - b.similarity_score);

    return res.json({
      query_hashes: { phash, dhash },
      total_matches: matches.length,
      matches,
    });
  } catch (err) {
    console.error("Search Error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
};
