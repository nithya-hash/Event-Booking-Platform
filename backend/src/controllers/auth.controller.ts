import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { UnauthorizedError } from "../utils/AppError";

const REFRESH_COOKIE = "refreshToken";
const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  // Cross-site cookies (frontend on vercel.app, backend on onrender.com)
  // require sameSite "none" + secure, or browsers block them on AJAX
  // requests. Locally frontend/backend share "localhost" so "lax" is
  // fine and avoids needing HTTPS in dev.
  sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function register(req: Request, res: Response): Promise<void> {
  const { accessToken, refreshToken, user } = await authService.registerUser(req.body);
  res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTS);
  res.status(201).json({ accessToken, user });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { accessToken, refreshToken, user } = await authService.loginUser(req.body);
  res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTS);
  res.status(200).json({ accessToken, user });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    throw new UnauthorizedError("No refresh token provided");
  }
  const { accessToken } = await authService.refreshAccessToken(token);
  res.status(200).json({ accessToken });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie(REFRESH_COOKIE);
  res.status(204).send();
}
