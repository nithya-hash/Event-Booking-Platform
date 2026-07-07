import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔹 Helper: add availableSeats and remove bookings
function withAvailability(event: any) {
  const booked = event.bookings.reduce(
    (sum: number, b: { seatsBooked: number }) => sum + b.seatsBooked,
    0
  );

  // remove bookings from response
  const rest = { ...event };
  delete rest.bookings;

  return {
    ...rest,
    availableSeats: event.capacity - booked,
  };
}

// 🔹 Get all events
export async function getAllEvents() {
  const events = await prisma.event.findMany({
    include: {
      bookings: true,
    },
  });

  return events.map(withAvailability);
}

// 🔹 Get event by ID
export async function getEventById(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      bookings: true,
    },
  });

  if (!event) return null;

  return withAvailability(event);
}

// 🔹 Create event
export async function createEvent(data: {
  title: string;
  description?: string;
  date: Date;
  capacity: number;
}) {
  return prisma.event.create({
    data,
  });
}

// 🔹 Update event
export async function updateEvent(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    date: Date;
    capacity: number;
  }>
) {
  return prisma.event.update({
    where: { id },
    data,
  });
}

// 🔹 Delete event
export async function deleteEvent(id: string) {
  return prisma.event.delete({
    where: { id },
  });
}