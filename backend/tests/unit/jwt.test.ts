import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from "../../src/utils/jwt";

describe("jwt utils", () => {
  const payload = { sub: "user-123", email: "test@test.com", role: "USER" as const };

  it("signs and verifies a valid access token", () => {
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it("throws when verifying a tampered access token", () => {
    const token = signAccessToken(payload);
    const tampered = token.slice(0, -2) + "xx";
    expect(() => verifyAccessToken(tampered)).toThrow();
  });

  it("signs and verifies a valid refresh token", () => {
    const token = signRefreshToken("user-123");
    const decoded = verifyRefreshToken(token);
    expect(decoded.sub).toBe("user-123");
  });

  it("rejects a refresh token verified as an access token", () => {
    // refresh tokens are signed with a different secret, so cross-use must fail
    const refreshToken = signRefreshToken("user-123");
    expect(() => verifyAccessToken(refreshToken)).toThrow();
  });
});
