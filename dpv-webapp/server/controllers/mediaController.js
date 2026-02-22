const axios = require("axios");
const Media = require("../models/Media");

exports.registerMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    // 🔍 Call AI service
    const aiResponse = await axios.post(
      "http://localhost:8000/ai/generate-hashes",
      { file_url: fileUrl }
    );

    const { phash, dhash } = aiResponse.data;

    // 🛑 CHECK DUPLICATE
    const existing = await Media.findByHashes(phash, dhash);

    if (existing) {
      return res.status(409).json({
        message: "Duplicate media detected",
        existing_media_url: existing.storage_url,
      });
    }

    // ✅ SAVE MEDIA
    const mediaId = await Media.create(
      req.user.id,
      req.file.originalname,
      fileUrl,
      phash,
      dhash
    );

    return res.status(201).json({
      message: "Media registered successfully",
      mediaId,
      fileUrl,
      phash,
      dhash,
    });
  } catch (err) {
    console.error("Media Register Error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
};
