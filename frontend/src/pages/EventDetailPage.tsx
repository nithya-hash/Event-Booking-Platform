import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEvent, useDeleteEvent } from "../hooks/useEvents";
import { useCreateBooking } from "../hooks/useBookings";
import { useAuthStore } from "../store/auth.store";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { getErrorMessage } from "../utils/errors";

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: event, isLoading, isError, error, refetch } = useEvent(id);
  const createBooking = useCreateBooking();
  const deleteEvent = useDeleteEvent();
  const [seats, setSeats] = useState(1);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (isLoading) return <LoadingSpinner label="Loading event..." />;
  if (isError || !event) return <ErrorMessage error={error} onRetry={refetch} />;

  const soldOut = event.availableSeats <= 0;
  const isOwner = user?.id === event.creatorId;

  function handleBook() {
    setBookingError(null);
    setBookingSuccess(false);
    if (!event) return;
    createBooking.mutate(
      { eventId: event.id, seatsBooked: seats },
      {
        onSuccess: () => setBookingSuccess(true),
        onError: (err) => setBookingError(getErrorMessage(err)),
      }
    );
  }

  function handleDelete() {
    if (!event) return;
    if (!confirm("Delete this event? This cannot be undone.")) return;
    deleteEvent.mutate(event.id, {
      onSuccess: () => navigate("/"),
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{event.title}</h1>
            <p className="mt-1 text-slate-500">{event.venue}</p>
          </div>
          <p className="whitespace-nowrap text-xl font-semibold text-brand-700">
            {event.price > 0 ? `$${event.price.toFixed(2)}` : "Free"}
          </p>
        </div>

        <p className="mt-4 text-slate-700">{event.description}</p>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-400">Starts</dt>
            <dd className="font-medium text-slate-800">{new Date(event.startTime).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Ends</dt>
            <dd className="font-medium text-slate-800">{new Date(event.endTime).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Capacity</dt>
            <dd className="font-medium text-slate-800">{event.capacity} seats</dd>
          </div>
          <div>
            <dt className="text-slate-400">Available</dt>
            <dd className={`font-medium ${soldOut ? "text-red-600" : "text-slate-800"}`}>
              {soldOut ? "Sold out" : `${event.availableSeats} seats`}
            </dd>
          </div>
        </dl>

        {isOwner && (
          <div className="mt-6 flex gap-3 border-t border-slate-100 pt-4">
            <button
              onClick={handleDelete}
              disabled={deleteEvent.isPending}
              className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {deleteEvent.isPending ? "Deleting..." : "Delete event"}
            </button>
          </div>
        )}

        {!isOwner && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            {!user ? (
              <p className="text-sm text-slate-500">
                <a href="/login" className="font-medium text-brand-600 hover:underline">
                  Log in
                </a>{" "}
                to book this event.
              </p>
            ) : soldOut ? (
              <p className="text-sm font-medium text-red-600">This event is sold out.</p>
            ) : bookingSuccess ? (
              <p className="rounded-md bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                Booking confirmed! Check{" "}
                <a href="/my-bookings" className="underline">
                  My Bookings
                </a>
                .
              </p>
            ) : (
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Seats</label>
                  <input
                    type="number"
                    min={1}
                    max={event.availableSeats}
                    value={seats}
                    onChange={(e) => setSeats(Math.max(1, Number(e.target.value)))}
                    className="mt-1 w-24 rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  onClick={handleBook}
                  disabled={createBooking.isPending}
                  className="rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {createBooking.isPending ? "Booking..." : "Book now"}
                </button>
                {bookingError && <p className="w-full text-sm text-red-600">{bookingError}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
