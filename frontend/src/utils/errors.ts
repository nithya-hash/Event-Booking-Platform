import { AxiosError } from "axios";
import type { ApiErrorShape } from "../types";

export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorShape | undefined;
    if (data?.error?.message) return data.error.message;
    if (error.message) return error.message;
  }
  return fallback;
}
