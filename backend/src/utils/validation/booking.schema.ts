import { z } from "zod";

export const createBookingSchema = z.object({
  eventId: z.string().uuid(),
  seatsBooked: z.number().int().positive().default(1),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
