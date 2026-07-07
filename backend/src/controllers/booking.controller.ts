import { Request, Response } from "express";
import * as bookingService from "../services/booking.service";

export async function create(req: Request, res: Response): Promise<void> {
  const booking = await bookingService.createBooking(req.body, req.user!.sub);
  res.status(201).json(booking);
}

export async function listMine(req: Request, res: Response): Promise<void> {
  const bookings = await bookingService.listMyBookings(req.user!.sub);
  res.status(200).json({ data: bookings });
}

export async function cancel(req: Request, res: Response): Promise<void> {
  const booking = await bookingService.cancelBooking(
    req.params.id,
    req.user!.sub,
    req.user!.role === "ADMIN"
  );
  res.status(200).json(booking);
}
