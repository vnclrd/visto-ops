import { Response } from "express";

export class AccountMiddleware {
  /**
   * Formats and returns consistent error responses across account endpoints.
   */
  static handleError(res: Response, error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected server error occurred";

    // Returns a 401 Unauthorized for invalid credentials or missing inputs
    return res.status(401).json({
      success: false,
      error: message,
    });
  }
}