import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { useLogout } from "../hooks/useAuth";

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();

  function handleLogout() {
    logout.mutate(undefined, {
      onSettled: () => navigate("/"),
    });
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold text-brand-700">
          EventBooking
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-slate-600 hover:text-slate-900">
            Browse Events
          </Link>

          {user ? (
            <>
              <Link to="/my-bookings" className="text-slate-600 hover:text-slate-900">
                My Bookings
              </Link>
              <Link to="/events/new" className="text-slate-600 hover:text-slate-900">
                Create Event
              </Link>
              <span className="text-slate-400">{user.email}</span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-slate-100 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-200"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-slate-900">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-brand-600 px-3 py-1.5 font-medium text-white hover:bg-brand-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
