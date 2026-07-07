export type Role = "USER" | "ADMIN";
export type BookingStatus = "CONFIRMED" | "CANCELLED";

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  venue: string;
  startTime: string;
  endTime: string;
  capacity: number;
  price: number;
  availableSeats: number;
  creatorId: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  seatsBooked: number;
  status: BookingStatus;
  createdAt: string;
  event: Event;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface ApiErrorShape {
  error: {
    message: string;
    details?: Record<string, string[] | undefined>;
  };
}
