import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { LoadingSpinner } from "./LoadingSpinner";

export function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const location = useLocation();

  // Wait for the silent-refresh attempt to finish before deciding -
  // otherwise a logged-in user gets bounced to /login on every page reload.
  if (isInitializing) {
    return <LoadingSpinner label="Checking your session..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
