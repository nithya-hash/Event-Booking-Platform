import { Router } from "express";
import { authRouter } from "./auth.routes";
import { eventRouter } from "./event.routes";
import { bookingRouter } from "./booking.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/events", eventRouter);
apiRouter.use("/bookings", bookingRouter);
