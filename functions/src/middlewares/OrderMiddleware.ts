import type { Response } from "express";
import type { OrderProcessRequest } from "../functions/visto-orderProcess/request";

export class OrderMiddleware {
  static validate(payload: OrderProcessRequest) {
    if (!payload.clientId?.trim()) {
      throw new Error("clientId is required");
    }
    if (!payload.storeId?.trim()) {
      throw new Error("storeId is required");
    }
    if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
      throw new Error("Cart items array cannot be empty");
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