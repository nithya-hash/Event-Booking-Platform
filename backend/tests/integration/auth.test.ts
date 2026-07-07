import request from "supertest";
import { app } from "../../src/server";
import { cleanDb, disconnectDb } from "./helpers";

describe("Auth API", () => {
  const credentials = { email: "demo@test.com", password: "Password123!", name: "Demo User" };

  beforeAll(async () => {
    await cleanDb();
  });

  afterAll(async () => {
    await cleanDb();
    await disconnectDb();
  });

  describe("POST /api/v1/auth/register", () => {
    it("registers a new user and returns an access token", async () => {
      const res = await request(app).post("/api/v1/auth/register").send(credentials);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body.user.email).toBe(credentials.email);
    });

    it("rejects a duplicate email with 409", async () => {
      const res = await request(app).post("/api/v1/auth/register").send(credentials);
      expect(res.status).toBe(409);
    });

    it("rejects an invalid payload with 400", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ email: "not-an-email", password: "short", name: "" });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("returns tokens for valid credentials", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: credentials.email, password: credentials.password });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
    });

    it("rejects invalid credentials with 401", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: credentials.email, password: "wrong-password" });
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    it("issues a new access token given a valid refresh cookie", async () => {
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: credentials.email, password: credentials.password });

      const cookies = loginRes.headers["set-cookie"];
      const refreshRes = await request(app).post("/api/v1/auth/refresh").set("Cookie", cookies);

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body).toHaveProperty("accessToken");
    });

    it("rejects a request with no refresh cookie", async () => {
      const res = await request(app).post("/api/v1/auth/refresh");
      expect(res.status).toBe(401);
    });
  });
});
