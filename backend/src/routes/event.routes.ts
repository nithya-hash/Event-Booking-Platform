import { Router } from "express";
import * as eventController from "../controllers/event.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateBody, validateQuery } from "../middlewares/validate.middleware";
import { createEventSchema, listEventsQuerySchema, updateEventSchema } from "../utils/validation/event.schema";
import { asyncHandler } from "../utils/asyncHandler";

export const eventRouter = Router();

/**
 * @openapi
 * /events:
 *   get:
 *     summary: List events (paginated, optionally filtered by venue)
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 100 }
 *       - in: query
 *         name: venue
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: A paginated list of events
 */
eventRouter.get("/", validateQuery(listEventsQuerySchema), asyncHandler(eventController.list));

/**
 * @openapi
 * /events/{id}:
 *   get:
 *     summary: Get a single event by id
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: The event, including computed availableSeats
 *       404:
 *         description: Event not found
 */
eventRouter.get("/:id", asyncHandler(eventController.getOne));

/**
 * @openapi
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, venue, startTime, endTime, capacity]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               venue: { type: string }
 *               startTime: { type: string, format: date-time }
 *               endTime: { type: string, format: date-time }
 *               capacity: { type: integer, minimum: 1 }
 *               price: { type: number, minimum: 0 }
 *     responses:
 *       201:
 *         description: Event created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 */
eventRouter.post(
  "/",
  requireAuth,
  validateBody(createEventSchema),
  asyncHandler(eventController.create)
);

/**
 * @openapi
 * /events/{id}:
 *   patch:
 *     summary: Update an event (only the creator or an admin may do this)
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Event updated
 *       403:
 *         description: Not the event owner
 *       404:
 *         description: Event not found
 */
eventRouter.patch(
  "/:id",
  requireAuth,
  validateBody(updateEventSchema),
  asyncHandler(eventController.update)
);

/**
 * @openapi
 * /events/{id}:
 *   delete:
 *     summary: Delete an event (only the creator or an admin may do this)
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Event deleted
 *       403:
 *         description: Not the event owner
 *       404:
 *         description: Event not found
 */
eventRouter.delete("/:id", requireAuth, asyncHandler(eventController.remove));
