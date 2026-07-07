import { NextFunction, Request, Response } from "express";

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// Express 4 does not catch rejected promises from async route handlers.
// Wrapping every controller ensures thrown errors reach errorHandler
// instead of crashing the process or hanging the request.
export function asyncHandler(fn: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
