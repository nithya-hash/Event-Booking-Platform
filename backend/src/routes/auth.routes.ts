import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "../utils/validation/auth.schema";
import { asyncHandler } from "../utils/asyncHandler";

export const authRouter = Router();

// Slow down brute-force attempts on auth endpoints specifically.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: User created, returns access token and sets refresh cookie
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 */
authRouter.post(
  "/register",
  authLimiter,
  validateBody(registerSchema),
  asyncHandler(authController.register)
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Returns access token and sets refresh cookie
 *       401:
 *         description: Invalid credentials
 */
authRouter.post(
  "/login",
  authLimiter,
  validateBody(loginSchema),
  asyncHandler(authController.login)
);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Exchange a valid refresh cookie for a new access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Missing or invalid refresh token
 */
authRouter.post("/refresh", asyncHandler(authController.refresh));

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Clear the refresh token cookie
 *     tags: [Auth]
 *     responses:
 *       204:
 *         description: Logged out
 */
authRouter.post("/logout", asyncHandler(authController.logout));
