import bcrypt from "bcryptjs";
import { prisma } from "../config/db";
import { ConflictError, UnauthorizedError } from "../utils/AppError";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { LoginInput, RegisterInput } from "../utils/validation/auth.schema";

const SALT_ROUNDS = 12;

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }

  const hashed = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email: input.email, password: hashed, name: input.name },
  });

  return issueTokens(user.id, user.email, user.role);
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  return issueTokens(user.id, user.email, user.role);
}

export async function refreshAccessToken(refreshToken: string) {
  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new UnauthorizedError("User no longer exists");
  }

  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  return { accessToken };
}

function issueTokens(userId: string, email: string, role: "USER" | "ADMIN") {
  const accessToken = signAccessToken({ sub: userId, email, role });
  const refreshToken = signRefreshToken(userId);
  return {
    accessToken,
    refreshToken,
    user: { id: userId, email, role },
  };
}
