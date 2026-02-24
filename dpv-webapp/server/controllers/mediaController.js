const axios = require("axios");
const path = require("path"); // Added to handle file paths
const Media = require("../models/Media");

exports.registerMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // 1. Get the local absolute path for the Python service
    const absolutePath = path.resolve(req.file.path);
    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    // 2. 🔍 Call AI service using the LOCAL endpoint
    // This is faster as Python reads the file directly from your disk
    const aiResponse = await axios.post(
      "http://localhost:8000/ai/generate-hashes-local",
      { file_path: absolutePath }
    );

    const { phash, dhash } = aiResponse.data;

    // 3. 🛑 CHECK DUPLICATE
    // This uses your custom Hamming distance logic on the database level
    const existing = await Media.findByHashes(phash, dhash);

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Duplicate media detected! This image is already in our registry.",
        existing_media_url: existing.storage_url,
      });
    }

    // 4. ✅ SAVE MEDIA TO MYSQL
    const mediaId = await Media.create(
      req.user.id,
      req.file.originalname,
      fileUrl,
      phash,
      dhash
    );

    // 5. Return standardized response
    return res.status(201).json({
      success: true,
      message: "Media registered successfully",
      data: {
        mediaId,
        fileUrl,
        phash,
        dhash,
      }
    });
    
  } catch (err) {
    console.error("Media Register Error:", err.message);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during media processing",
      error: err.message 
    });
  }
};
