import type { NextFunction, Request, Response } from "express";
import z, { type ZodSchema } from "zod";

interface MiddlewareFunction {
  (req: Request, res: Response, next: NextFunction): void;
}

export async function validateInput(schema: ZodSchema): Promise<MiddlewareFunction> {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: error
      });
    }
  };
}