import { api } from "./client";
import type { Event, PaginatedResponse } from "../types";

export interface ListEventsParams {
  page?: number;
  limit?: number;
  venue?: string;
}

export interface CreateEventInput {
  title: string;
  description: string;
  venue: string;
  startTime: string;
  endTime: string;
  capacity: number;
  price: number;
}

export async function listEvents(params: ListEventsParams) {
  const { data } = await api.get<PaginatedResponse<Event>>("/events", { params });
  return data;
}

export async function getEvent(id: string) {
  const { data } = await api.get<Event>(`/events/${id}`);
  return data;
}

export async function createEvent(input: CreateEventInput) {
  const { data } = await api.post<Event>("/events", input);
  return data;
}

export async function updateEvent(id: string, input: Partial<CreateEventInput>) {
  const { data } = await api.patch<Event>(`/events/${id}`, input);
  return data;
}

export async function deleteEvent(id: string) {
  await api.delete(`/events/${id}`);
}
