import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as authApi from "../api/auth";
import { useAuthStore } from "../store/auth.store";
import { userFromAccessToken } from "../utils/token";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      queryClient.invalidateQueries();
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      queryClient.invalidateQueries();
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuth();
      queryClient.clear();
    },
  });
}

// On first app load, there's no access token in memory yet (page was
// refreshed or freshly opened). Attempt a silent refresh using the
// httpOnly cookie so a returning logged-in user doesn't have to log in
// again every time they reload the page.
export function useSilentRefresh() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const finishInitializing = useAuthStore((s) => s.finishInitializing);

  useEffect(() => {
    let cancelled = false;
    authApi
      .refresh()
      .then((data) => {
        if (!cancelled) setAuth(userFromAccessToken(data.accessToken), data.accessToken);
      })
      .catch(() => {
        // No valid refresh cookie - user simply isn't logged in. Not an error.
      })
      .finally(() => {
        if (!cancelled) finishInitializing();
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
