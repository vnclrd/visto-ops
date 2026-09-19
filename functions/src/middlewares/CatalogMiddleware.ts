import type { Response } from "express";

export class CatalogMiddleware {
  static validateGetRequest(clientId?: string, storeId?: string) {
    if (!clientId || !clientId.trim()) {
      throw new Error("clientId is required");
    }
    if (!storeId || !storeId.trim()) {
      throw new Error("storeId is required");
    }
  }

  static handleError(res: Response, error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    res.status(400).json({
      success: false,
      error: message,
    });
  }
}