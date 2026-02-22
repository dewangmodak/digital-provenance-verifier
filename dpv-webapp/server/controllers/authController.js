// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successResponse, errorResponse } = require("../utils/responseHandler");

exports.registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required');
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return errorResponse(res, 400, 'Email already registered');
    }

    const hash = await bcrypt.hash(password, 10);
    const userId = await User.create(email, hash);

    // New users are 'user' by default based on our MySQL setup
    const role = 'user';

    const token = jwt.sign(
      { id: userId, role: role }, // 👈 Injecting role here
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    return successResponse(res, 201, 'User registered successfully', { 
      token, 
      userId, 
      role 
    });
  } catch (err) {
    next(err); // 👈 Passing to our global error handler
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required');
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return errorResponse(res, 400, 'Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return errorResponse(res, 400, 'Invalid email or password');
    }

    // Grab the role from the database, fallback to 'user' just in case
    const role = user.role || 'user';

    const token = jwt.sign(
      { id: user.id, role: role }, // 👈 Injecting role here
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    return successResponse(res, 200, 'Login successful', { 
      token, 
      userId: user.id, 
      role 
    });
  } catch (err) {
    next(err); // 👈 Passing to our global error handler
  }
};