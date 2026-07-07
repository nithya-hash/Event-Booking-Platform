import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      password: passwordHash,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  const attendee = await prisma.user.upsert({
    where: { email: "user@demo.com" },
    update: {},
    create: {
      email: "user@demo.com",
      password: passwordHash,
      name: "Demo Attendee",
      role: "USER",
    },
  });

  const event1 = await prisma.event.create({
    data: {
      title: "Tech Conference 2026",
      description: "A full-day conference on modern web development.",
      venue: "Chennai Trade Centre",
      startTime: new Date("2026-08-15T09:00:00Z"),
      endTime: new Date("2026-08-15T18:00:00Z"),
      capacity: 200,
      price: 49.99,
      creatorId: admin.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: "Live Jazz Night",
      description: "An evening of live jazz performances.",
      venue: "Phoenix Marketcity, Chennai",
      startTime: new Date("2026-08-20T19:00:00Z"),
      endTime: new Date("2026-08-20T22:00:00Z"),
      capacity: 80,
      price: 15,
      creatorId: admin.id,
    },
  });

  await prisma.booking.create({
    data: { eventId: event1.id, userId: attendee.id, seatsBooked: 2 },
  });

  console.log("Seed complete:");
  console.log(`  Admin login:    admin@demo.com / Password123!`);
  console.log(`  Attendee login: user@demo.com / Password123!`);
  console.log(`  Events created: ${event1.title}, ${event2.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
