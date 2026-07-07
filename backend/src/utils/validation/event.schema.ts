import { z } from "zod";

export const createEventSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    venue: z.string().min(1),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    capacity: z.number().int().positive(),
    price: z.number().nonnegative().default(0),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "endTime must be after startTime",
    path: ["endTime"],
  });

export const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  venue: z.string().min(1).optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  capacity: z.number().int().positive().optional(),
  price: z.number().nonnegative().optional(),
});

export const listEventsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  venue: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
