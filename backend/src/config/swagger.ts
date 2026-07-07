import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

// Works whether running via ts-node-dev (src/*.ts) or the compiled
// build (dist/*.js), since the glob pattern matches both extensions.
const routeFilesGlob = path.join(__dirname, "../routes/*.{ts,js}");

const swaggerDefinition: swaggerJsdoc.Options["definition"] = {
  openapi: "3.0.3",
  info: {
    title: "Event Booking Platform API",
    version: "1.0.0",
    description:
      "REST API for browsing events, managing bookings, and handling authentication for the Event Booking Platform capstone project.",
  },
  servers: [{ url: "/api/v1", description: "API v1" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: { message: { type: "string" } },
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["USER", "ADMIN"] },
        },
      },
      Event: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          description: { type: "string" },
          venue: { type: "string" },
          startTime: { type: "string", format: "date-time" },
          endTime: { type: "string", format: "date-time" },
          capacity: { type: "integer" },
          price: { type: "number" },
          availableSeats: { type: "integer" },
        },
      },
      Booking: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          eventId: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          seatsBooked: { type: "integer" },
          status: { type: "string", enum: ["CONFIRMED", "CANCELLED"] },
        },
      },
    },
  },
};

export const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [routeFilesGlob],
});
