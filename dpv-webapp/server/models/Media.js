const pool = require("../config/mysql");

const Media = {
  // 1. Find exact matches
  findByHashes: async (phash, dhash) => {
    const [rows] = await pool.execute(
      `
      SELECT id, storage_url 
      FROM registered_media 
      WHERE phash = ? AND dhash = ? 
      LIMIT 1
      `,
      [phash, dhash]
    );
    return rows[0];
  },

  // 2. Create record (Fixed to accept the 5 parameters your controller sends)
  create: async (userId, originalName, storageUrl, phash, dhash) => {
    const [result] = await pool.execute(
      `
      INSERT INTO registered_media 
      (user_id, original_filename, storage_url, phash, dhash) 
      VALUES (?, ?, ?, ?, ?)
      `,
      [userId, originalName, storageUrl, phash, dhash]
    );

    return result.insertId;
  },

  // 3. Get all for similarity search
  getAllHashes: async () => {
    try {
      const [rows] = await pool.query(
        "SELECT id, storage_url, phash, dhash FROM registered_media"
      );
      return [rows]; 
    } catch (error) {
      console.error("Database Error in Media.js:", error);
      throw error;
    }
  },

  // ✅ 4. NEW: Find all media for a specific user
  findByUserId: async (userId) => {
    try {
      const [rows] = await pool.execute(
        `
        SELECT * FROM registered_media 
        WHERE user_id = ? 
        ORDER BY id DESC
        `,
        [userId] // 💡 Changed ORDER BY created_at to ORDER BY id
      );
      return rows;
    } catch (error) {
      console.error("Database Error fetching user media:", error);
      throw error;
    }
  },
};

module.exports = Media;