import { registerSchema, loginSchema } from "../../src/utils/validation/auth.schema";

describe("registerSchema", () => {
  it("accepts a valid registration payload", () => {
    const result = registerSchema.safeParse({
      email: "test@test.com",
      password: "Password123!",
      name: "Test User",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({
      email: "not-an-email",
      password: "Password123!",
      name: "Test User",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      email: "test@test.com",
      password: "short",
      name: "Test User",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing name", () => {
    const result = registerSchema.safeParse({
      email: "test@test.com",
      password: "Password123!",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts a valid login payload", () => {
    const result = loginSchema.safeParse({ email: "test@test.com", password: "anything" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "test@test.com", password: "" });
    expect(result.success).toBe(false);
  });
});
