import { Request, Response } from "express";
import * as eventService from "../services/event.service";

export async function list(req: Request, res: Response): Promise<void> {
  const result = await eventService.listEvents(req.query as unknown as Parameters<typeof eventService.listEvents>[0]);
  res.status(200).json(result);
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const event = await eventService.getEventById(req.params.id);
  res.status(200).json(event);
}

export async function create(req: Request, res: Response): Promise<void> {
  const event = await eventService.createEvent(req.body, req.user!.sub);
  res.status(201).json(event);
}

export async function update(req: Request, res: Response): Promise<void> {
  const event = await eventService.updateEvent(
    req.params.id,
    req.body,
    req.user!.sub,
    req.user!.role === "ADMIN"
  );
  res.status(200).json(event);
}

export async function remove(req: Request, res: Response): Promise<void> {
  await eventService.deleteEvent(req.params.id, req.user!.sub, req.user!.role === "ADMIN");
  res.status(204).send();
}
