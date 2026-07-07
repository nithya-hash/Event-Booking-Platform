import { Link } from "react-router-dom";
import { useMyBookings, useCancelBooking } from "../hooks/useBookings";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { EmptyState } from "../components/EmptyState";

export function MyBookingsPage() {
  const { data: bookings, isLoading, isError, error, refetch } = useMyBookings();
  const cancelBooking = useCancelBooking();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My Bookings</h1>

      {isLoading && <LoadingSpinner label="Loading your bookings..." />}
      {isError && <ErrorMessage error={error} onRetry={refetch} />}

      {!isLoading && !isError && bookings && bookings.length === 0 && (
        <EmptyState title="No bookings yet" description="Browse events and book your first seat." />
      )}

      {!isLoading && !isError && bookings && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4"
            >
              <div>
                <Link to={`/events/${booking.eventId}`} className="font-medium text-slate-900 hover:underline">
                  {booking.event.title}
                </Link>
                <p className="text-sm text-slate-500">
                  {booking.event.venue} - {new Date(booking.event.startTime).toLocaleString()}
                </p>
                <p className="text-sm text-slate-500">{booking.seatsBooked} seat(s)</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    booking.status === "CONFIRMED" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {booking.status}
                </span>
                {booking.status === "CONFIRMED" && (
                  <button
                    onClick={() => cancelBooking.mutate(booking.id)}
                    disabled={cancelBooking.isPending}
                    className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
