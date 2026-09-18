import type { Response } from "express";

export class IngredientMiddleware {
  static handleError(res: Response, error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    res.status(400).json({
      success: false,
      error: message,
    });
  }
}