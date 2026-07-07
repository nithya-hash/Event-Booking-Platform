import { Router } from "express";
import * as bookingController from "../controllers/booking.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validate.middleware";
import { createBookingSchema } from "../utils/validation/booking.schema";
import { asyncHandler } from "../utils/asyncHandler";

export const bookingRouter = Router();

bookingRouter.use(requireAuth); // every booking route requires a logged-in user

/**
 * @openapi
 * /bookings:
 *   post:
 *     summary: Book seats for an event
 *     tags: [Bookings]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId]
 *             properties:
 *               eventId: { type: string, format: uuid }
 *               seatsBooked: { type: integer, minimum: 1, default: 1 }
 *     responses:
 *       201:
 *         description: Booking created
 *       400:
 *         description: Not enough seats available
 *       404:
 *         description: Event not found
 */
bookingRouter.post("/", validateBody(createBookingSchema), asyncHandler(bookingController.create));

/**
 * @openapi
 * /bookings/me:
 *   get:
 *     summary: List the current user's bookings
 *     tags: [Bookings]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: A list of the caller's bookings, each including its event
 */
bookingRouter.get("/me", asyncHandler(bookingController.listMine));

/**
 * @openapi
 * /bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel a booking (only the booking owner or an admin may do this)
 *     tags: [Bookings]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Booking cancelled
 *       403:
 *         description: Not the booking owner
 *       404:
 *         description: Booking not found
 */
bookingRouter.patch("/:id/cancel", asyncHandler(bookingController.cancel));
