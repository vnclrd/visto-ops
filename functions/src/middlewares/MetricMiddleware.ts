import type { Response } from "express";
import type { MetricsGetRequest } from "../functions/visto-metricsGet/request";

export class MetricMiddleware {
  static validate(payload: MetricsGetRequest) {
    if (!payload.clientId || !payload.clientId.trim()) {
      throw new Error("clientId is required");
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