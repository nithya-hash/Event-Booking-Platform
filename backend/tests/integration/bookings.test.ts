import request from "supertest";
import { app } from "../../src/server";
import { cleanDb, disconnectDb } from "./helpers";

describe("Bookings API", () => {
  let userToken: string;
  let otherUserToken: string;
  let smallEventId: string;

  beforeAll(async () => {
    await cleanDb();

    const user = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "attendee@test.com", password: "Password123!", name: "Attendee" });
    userToken = user.body.accessToken;

    const other = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "attendee2@test.com", password: "Password123!", name: "Attendee Two" });
    otherUserToken = other.body.accessToken;

    // A tiny-capacity event to make the overbooking test deterministic.
    const event = await request(app)
      .post("/api/v1/events")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Small Workshop",
        description: "Limited seats.",
        venue: "Room 101",
        startTime: "2026-10-01T09:00:00Z",
        endTime: "2026-10-01T11:00:00Z",
        capacity: 3,
      });
    smallEventId = event.body.id;
  });

  afterAll(async () => {
    await cleanDb();
    await disconnectDb();
  });

  it("rejects booking without auth", async () => {
    const res = await request(app).post("/api/v1/bookings").send({ eventId: smallEventId, seatsBooked: 1 });
    expect(res.status).toBe(401);
  });

  it("creates a booking within capacity", async () => {
    const res = await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ eventId: smallEventId, seatsBooked: 2 });
    expect(res.status).toBe(201);
    expect(res.body.seatsBooked).toBe(2);
  });

  it("rejects a booking that would exceed remaining capacity", async () => {
    // Only 1 seat left (3 capacity - 2 already booked), requesting 2 should fail.
    const res = await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${otherUserToken}`)
      .send({ eventId: smallEventId, seatsBooked: 2 });
    expect(res.status).toBe(400);
  });

  it("allows a booking that exactly fills remaining capacity", async () => {
    const res = await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${otherUserToken}`)
      .send({ eventId: smallEventId, seatsBooked: 1 });
    expect(res.status).toBe(201);
  });

  it("rejects booking for a nonexistent event", async () => {
    const res = await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ eventId: "00000000-0000-0000-0000-000000000000", seatsBooked: 1 });
    expect(res.status).toBe(404);
  });

  it("lists the current user's bookings", async () => {
    const res = await request(app).get("/api/v1/bookings/me").set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty("event");
  });

  it("prevents cancelling someone else's booking", async () => {
    const mine = await request(app).get("/api/v1/bookings/me").set("Authorization", `Bearer ${userToken}`);
    const bookingId = mine.body.data[0].id;

    const res = await request(app)
      .patch(`/api/v1/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${otherUserToken}`);
    expect(res.status).toBe(403);
  });

  it("allows cancelling your own booking, freeing up capacity", async () => {
    const mine = await request(app).get("/api/v1/bookings/me").set("Authorization", `Bearer ${userToken}`);
    const bookingId = mine.body.data[0].id;

    const cancelRes = await request(app)
      .patch(`/api/v1/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.status).toBe("CANCELLED");

    const eventRes = await request(app).get(`/api/v1/events/${smallEventId}`);
    // 2 were booked, 2 just cancelled -> only the 1-seat booking remains confirmed
    expect(eventRes.body.availableSeats).toBe(2);
  });
});
