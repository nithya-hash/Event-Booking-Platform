import request from "supertest";
import { app } from "../../src/server";
import { cleanDb, disconnectDb } from "./helpers";

describe("Events API", () => {
  let ownerToken: string;
  let otherUserToken: string;
  let eventId: string;

  beforeAll(async () => {
    await cleanDb();

    const owner = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "owner@test.com", password: "Password123!", name: "Owner" });
    ownerToken = owner.body.accessToken;

    const other = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "other@test.com", password: "Password123!", name: "Other" });
    otherUserToken = other.body.accessToken;
  });

  afterAll(async () => {
    await cleanDb();
    await disconnectDb();
  });

  it("rejects event creation without auth", async () => {
    const res = await request(app).post("/api/v1/events").send({});
    expect(res.status).toBe(401);
  });

  it("creates an event when authenticated", async () => {
    const res = await request(app)
      .post("/api/v1/events")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        title: "Music Festival",
        description: "An outdoor music festival.",
        venue: "City Park",
        startTime: "2026-09-10T18:00:00Z",
        endTime: "2026-09-10T23:00:00Z",
        capacity: 100,
        price: 25,
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Music Festival");
    eventId = res.body.id;
  });

  it("rejects event creation with invalid dates (end before start)", async () => {
    const res = await request(app)
      .post("/api/v1/events")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        title: "Bad Event",
        description: "Invalid dates.",
        venue: "Nowhere",
        startTime: "2026-09-10T18:00:00Z",
        endTime: "2026-09-10T10:00:00Z",
        capacity: 10,
      });
    expect(res.status).toBe(400);
  });

  it("lists events with pagination metadata", async () => {
    const res = await request(app).get("/api/v1/events?page=1&limit=10");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("pagination");
    expect(res.body.pagination.page).toBe(1);
  });

  it("gets a single event by id, including availableSeats", async () => {
    const res = await request(app).get(`/api/v1/events/${eventId}`);
    expect(res.status).toBe(200);
    expect(res.body.availableSeats).toBe(100);
  });

  it("returns 404 for a nonexistent event id", async () => {
    const res = await request(app).get("/api/v1/events/00000000-0000-0000-0000-000000000000");
    expect(res.status).toBe(404);
  });

  it("prevents a non-owner from updating the event", async () => {
    const res = await request(app)
      .patch(`/api/v1/events/${eventId}`)
      .set("Authorization", `Bearer ${otherUserToken}`)
      .send({ title: "Hijacked Title" });
    expect(res.status).toBe(403);
  });

  it("allows the owner to update the event", async () => {
    const res = await request(app)
      .patch(`/api/v1/events/${eventId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ title: "Music Festival (Updated)" });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Music Festival (Updated)");
  });

  it("prevents a non-owner from deleting the event", async () => {
    const res = await request(app)
      .delete(`/api/v1/events/${eventId}`)
      .set("Authorization", `Bearer ${otherUserToken}`);
    expect(res.status).toBe(403);
  });

  it("allows the owner to delete the event", async () => {
    const res = await request(app)
      .delete(`/api/v1/events/${eventId}`)
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(res.status).toBe(204);
  });
});
