import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { BadRequestError, ForbiddenError, NotFoundError } from "../utils/AppError";
import { CreateBookingInput } from "../utils/validation/booking.schema";

export async function createBooking(input: CreateBookingInput, userId: string) {
  // Wrapped in a transaction so a concurrent request can't push the
  // event over capacity between the read and the write.
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const event = await tx.event.findUnique({
      where: { id: input.eventId },
      include: { bookings: { where: { status: "CONFIRMED" }, select: { seatsBooked: true } } },
    });

    if (!event) throw new NotFoundError("Event not found");

    const alreadyBooked = event.bookings.reduce(
      (sum: number, b: { seatsBooked: number }) => sum + b.seatsBooked,
      0
    );
    const available = event.capacity - alreadyBooked;

    if (input.seatsBooked > available) {
      throw new BadRequestError(`Only ${available} seat(s) available for this event`);
    }

    return tx.booking.create({
      data: { eventId: input.eventId, userId, seatsBooked: input.seatsBooked },
    });
  });
}

export async function listMyBookings(userId: string) {
  return prisma.booking.findMany({
    where: { userId },
    include: { event: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function cancelBooking(bookingId: string, userId: string, isAdmin: boolean) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new NotFoundError("Booking not found");
  if (booking.userId !== userId && !isAdmin) {
    throw new ForbiddenError("You can only cancel your own bookings");
  }
  return prisma.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } });
}
