const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { registerUser, loginUser } = require("../controllers/authController");

jest.mock("../models/User");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("Auth Controller - Unit Tests", () => {

  test("registerUser should hash password and save user", async () => {
    const req = {
      body: { email: "test@example.com", password: "123456" }
    };

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    User.findByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed123");
    User.create.mockResolvedValue(1);
    jwt.sign.mockReturnValue("fake-jwt-token");

    await registerUser(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);
    expect(User.create).toHaveBeenCalledWith("test@example.com", "hashed123");
    
    // 🟢 Updated to match Standardized Response
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User registered successfully",
      data: {
        token: "fake-jwt-token",
        userId: 1,
        role: "user"
      }
    });
  });

  test("loginUser should return JWT if password matches", async () => {
    const req = {
      body: { email: "test@example.com", password: "123456" }
    };

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    User.findByEmail.mockResolvedValue({
      id: 1,
      email: "test@example.com",
      password_hash: "hashed123",
      role: "user" // Added role to mock
    });

    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("fake-login-token");

    await loginUser(req, res);

    expect(User.findByEmail).toHaveBeenCalledWith("test@example.com");
    expect(bcrypt.compare).toHaveBeenCalledWith("123456", "hashed123");
    
    // 🟢 Updated to match Standardized Response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Login successful",
      data: {
        token: "fake-login-token",
        userId: 1,
        role: "user"
      }
    });
  });
});