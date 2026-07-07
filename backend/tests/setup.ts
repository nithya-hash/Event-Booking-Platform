import dotenv from "dotenv";

// Load .env if present (for integration tests hitting a real local DB),
// but fall back to safe test defaults so unit tests can run with zero
// setup (e.g. in CI before secrets are configured, or for pure-logic tests).
dotenv.config();

process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test_db";
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "test-access-secret";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test-refresh-secret";
process.env.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";
