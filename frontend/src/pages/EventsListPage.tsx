import { useState } from "react";
import { useEvents } from "../hooks/useEvents";
import { EventCard } from "../components/EventCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { EmptyState } from "../components/EmptyState";

export function EventsListPage() {
  const [page, setPage] = useState(1);
  const [venue, setVenue] = useState("");
  const { data, isLoading, isError, error, refetch, isFetching } = useEvents({
    page,
    limit: 9,
    venue: venue || undefined,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Browse Events</h1>
        <input
          value={venue}
          onChange={(e) => {
            setVenue(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by venue..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none sm:w-64"
        />
      </div>

      {isLoading && <LoadingSpinner label="Loading events..." />}

      {isError && <ErrorMessage error={error} onRetry={refetch} />}

      {!isLoading && !isError && data && data.data.length === 0 && (
        <EmptyState title="No events found" description="Try a different venue filter, or check back later." />
      )}

      {!isLoading && !isError && data && data.data.length > 0 && (
        <>
          <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}>
            {data.data.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">
              Page {data.pagination.page} of {data.pagination.totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => (data.pagination.totalPages > p ? p + 1 : p))}
              disabled={page >= data.pagination.totalPages}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
