import { createEventSchema, listEventsQuerySchema } from "../../src/utils/validation/event.schema";

describe("createEventSchema", () => {
  const base = {
    title: "Tech Meetup",
    description: "A meetup for developers.",
    venue: "Community Hall",
    capacity: 50,
    price: 10,
  };

  it("accepts a valid event where endTime is after startTime", () => {
    const result = createEventSchema.safeParse({
      ...base,
      startTime: "2026-09-01T10:00:00Z",
      endTime: "2026-09-01T12:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an event where endTime is before startTime", () => {
    const result = createEventSchema.safeParse({
      ...base,
      startTime: "2026-09-01T12:00:00Z",
      endTime: "2026-09-01T10:00:00Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-positive capacity", () => {
    const result = createEventSchema.safeParse({
      ...base,
      capacity: 0,
      startTime: "2026-09-01T10:00:00Z",
      endTime: "2026-09-01T12:00:00Z",
    });
    expect(result.success).toBe(false);
  });

  it("defaults price to 0 when omitted", () => {
    const { price, ...withoutPrice } = base;
    void price;
    const result = createEventSchema.safeParse({
      ...withoutPrice,
      startTime: "2026-09-01T10:00:00Z",
      endTime: "2026-09-01T12:00:00Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(0);
    }
  });
});

describe("listEventsQuerySchema", () => {
  it("applies default page and limit when omitted", () => {
    const result = listEventsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects a limit above the max of 100", () => {
    const result = listEventsQuerySchema.safeParse({ limit: "500" });
    expect(result.success).toBe(false);
  });
});
