const request = require("supertest");
const app = require("../server"); 
const mongoose = require("mongoose");
const pool = require("../config/mysql");

// 🟢 Cleanup database connections after tests
afterAll(async () => {
  await mongoose.connection.close();
  await pool.end();
});

describe("Auth API - Integration Tests", () => {

  let token = "";
  let email = "inttest" + Date.now() + "@gmail.com";

  test("POST /api/v1/auth/register → should register a user", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email,
        password: "123456"
      });

    // 🟢 Updated: expect 201 and check res.body.data
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    token = res.body.data.token;
  });

  test("POST /api/v1/auth/login → should login and return token", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email,
        password: "123456"
      });

    // 🟢 Updated: check res.body.data
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });
});