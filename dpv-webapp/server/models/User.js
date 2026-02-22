// models/User.js
const pool = require('../config/mysql');

const User = {
  create: async (email, passwordHash) => {
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash]
    );
    return result.insertId;
  },

  findByEmail: async (email) => {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0]; // undefined if not found
  }
};

module.exports = User;
