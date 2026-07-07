import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as eventsApi from "../api/events";

export function useEvents(params: eventsApi.ListEventsParams) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: () => eventsApi.listEvents(params),
    placeholderData: (previousData) => previousData, // smooth pagination, no flash of empty state
  });
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ["events", id],
    queryFn: () => eventsApi.getEvent(id as string),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventsApi.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventsApi.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
