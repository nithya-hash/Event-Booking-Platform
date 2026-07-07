import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as bookingsApi from "../api/bookings";

export function useMyBookings() {
  return useQuery({
    queryKey: ["bookings", "me"],
    queryFn: bookingsApi.listMyBookings,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookingsApi.createBooking,
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
      // Refresh the specific event's availableSeats count too.
      queryClient.invalidateQueries({ queryKey: ["events", booking.eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookingsApi.cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
