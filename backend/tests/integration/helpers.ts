import { prisma } from "../../src/config/db";

// Deletes in FK-safe order: bookings depend on events and users,
// events depend on users. Used before/after integration suites so
// tests don't interfere with each other or leave junk in your dev DB.
export async function cleanDb(): Promise<void> {
  await prisma.booking.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();
}

export async function disconnectDb(): Promise<void> {
  await prisma.$disconnect();
}
