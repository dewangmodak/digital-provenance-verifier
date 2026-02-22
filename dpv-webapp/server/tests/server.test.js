const request = require("supertest");
const app = require("../server"); // We import your Express app!
const mongoose = require("mongoose");
const pool = require("../config/mysql");

// This runs AFTER all tests are finished to close the database connections.
// If we don't do this, Jest will hang forever waiting for the databases to close!
afterAll(async () => {
  await mongoose.connection.close();
  await pool.end();
});

describe("API Core Server Tests", () => {
  
  // Test 1: Check if the server is alive
  it("should return a 200 OK on the /api/v1/hello route", async () => {
    // Supertest fires a fake GET request to your app
    const res = await request(app).get("/api/v1/hello");
    
    // We 'expect' the server to respond correctly
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("webapp");
    expect(res.body.webapp).toBe("Node.js server is alive!");
  });

  // Test 2: Check if our Global Error Handler catches 404s
  it("should return a 404 error for a route that does not exist", async () => {
    const res = await request(app).get("/api/v1/this-route-is-fake");
    
    expect(res.statusCode).toEqual(404);
  });

});