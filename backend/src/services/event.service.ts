import { prisma } from "../config/db";
import { NotFoundError, ForbiddenError } from "../utils/AppError";
import { CreateEventInput, ListEventsQuery, UpdateEventInput } from "../utils/validation/event.schema";

export async function listEvents(query: ListEventsQuery) {
  const { page, limit, venue } = query;
  const where = venue ? { venue: { contains: venue, mode: "insensitive" as const } } : {};

  const [items, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { startTime: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { bookings: { where: { status: "CONFIRMED" }, select: { seatsBooked: true } } },
    }),
    prisma.event.count({ where }),
  ]);

  const data = items.map(withAvailability);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getEventById(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: { bookings: { where: { status: "CONFIRMED" }, select: { seatsBooked: true } } },
  });
  if (!event) throw new NotFoundError("Event not found");
  return withAvailability(event);
}

export async function createEvent(input: CreateEventInput, creatorId: string) {
  return prisma.event.create({ data: { ...input, creatorId } });
}

export async function updateEvent(id: string, input: UpdateEventInput, userId: string, isAdmin: boolean) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new NotFoundError("Event not found");
  if (event.creatorId !== userId && !isAdmin) {
    throw new ForbiddenError("You can only edit events you created");
  }
  return prisma.event.update({ where: { id }, data: input });
}

export async function deleteEvent(id: string, userId: string, isAdmin: boolean) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new NotFoundError("Event not found");
  if (event.creatorId !== userId && !isAdmin) {
    throw new ForbiddenError("You can only delete events you created");
  }
  await prisma.event.delete({ where: { id } });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withAvailability(event: any) {
  const booked = event.bookings.reduce((sum: number, b: { seatsBooked: number }) => sum + b.seatsBooked, 0);
  const { bookings: _bookings, ...rest } = event;
  return { ...rest, availableSeats: event.capacity - booked };
}
