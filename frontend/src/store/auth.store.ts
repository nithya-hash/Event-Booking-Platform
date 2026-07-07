import { create } from "zustand";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isInitializing: boolean; // true while we attempt a silent refresh on app load
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string | null) => void;
  clearAuth: () => void;
  finishInitializing: () => void;
}

// Access token lives only in memory (this store), never localStorage -
// that avoids exposing it to XSS. The refresh token is a separate
// httpOnly cookie the browser sends automatically; see api/client.ts.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isInitializing: true,
  setAuth: (user, accessToken) => set({ user, accessToken }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearAuth: () => set({ user: null, accessToken: null }),
  finishInitializing: () => set({ isInitializing: false }),
}));
