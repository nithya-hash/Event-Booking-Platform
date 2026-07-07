import { Link } from "react-router-dom";
import type { Event } from "../types";

function formatDateRange(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const dateFmt: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  const timeFmt: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  return `${start.toLocaleDateString(undefined, dateFmt)} · ${start.toLocaleTimeString(
    undefined,
    timeFmt
  )} - ${end.toLocaleTimeString(undefined, timeFmt)}`;
}

export function EventCard({ event }: { event: Event }) {
  const soldOut = event.availableSeats <= 0;

  return (
    <Link
      to={`/events/${event.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{event.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{event.venue}</p>
          <p className="mt-1 text-sm text-slate-500">{formatDateRange(event.startTime, event.endTime)}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-brand-700">{event.price > 0 ? `$${event.price.toFixed(2)}` : "Free"}</p>
          <p className={`mt-1 text-xs font-medium ${soldOut ? "text-red-600" : "text-slate-400"}`}>
            {soldOut ? "Sold out" : `${event.availableSeats} seats left`}
          </p>
        </div>
      </div>
    </Link>
  );
}
