import { api } from "./client";
import type { Booking } from "../types";

export async function createBooking(input: { eventId: string; seatsBooked: number }) {
  const { data } = await api.post<Booking>("/bookings", input);
  return data;
}

export async function listMyBookings() {
  const { data } = await api.get<{ data: Booking[] }>("/bookings/me");
  return data.data;
}

export async function cancelBooking(id: string) {
  const { data } = await api.patch<Booking>(`/bookings/${id}/cancel`);
  return data;
}
