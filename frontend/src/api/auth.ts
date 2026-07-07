import { api } from "./client";
import type { User } from "../types";

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export async function register(input: { email: string; password: string; name: string }) {
  const { data } = await api.post<AuthResponse>("/auth/register", input);
  return data;
}

export async function login(input: { email: string; password: string }) {
  const { data } = await api.post<AuthResponse>("/auth/login", input);
  return data;
}

export async function refresh() {
  const { data } = await api.post<{ accessToken: string }>("/auth/refresh");
  return data;
}

export async function logout() {
  await api.post("/auth/logout");
}
