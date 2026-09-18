import type { NextFunction, Request, Response } from "express";
import forestWorld from "./forestWorld";

export function generateWorldController(_req: Request, res: Response, next: NextFunction): void {
  try {
    res.status(200).json({
      success: true,
      message: "World generated successfully",
      data: forestWorld,
    });
  } catch (error) {
    next(error);
  }
}
