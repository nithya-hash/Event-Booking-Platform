import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

// Wraps a Zod schema to validate req.body. Throws ZodError on failure,
// which errorHandler converts into a clean 400 response.
// Accepts ZodTypeAny (not just AnyZodObject) so schemas built with
// .refine()/.transform() (which return ZodEffects) work too.
export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body);
    next();
  };
}

export function validateQuery(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.query = schema.parse(req.query) as typeof req.query;
    next();
  };
}
