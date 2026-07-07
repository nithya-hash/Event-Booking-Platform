import { jwtDecode } from "jwt-decode";
import type { Role, User } from "../types";

interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

// Decoding here is purely so the UI can show "logged in as X" without an
// extra round trip. It's never trusted for authorization - every
// protected request is re-verified by the backend regardless.
export function userFromAccessToken(token: string): User {
  const payload = jwtDecode<AccessTokenPayload>(token);
  return { id: payload.sub, email: payload.email, role: payload.role };
}
