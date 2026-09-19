import type { Response } from "express";
import type { DrinkManageRequest } from "../functions/visto-fnb-drinkManage/request";

export class DrinkMiddleware {
  static validateManageRequest(payload: DrinkManageRequest) {
    if (!payload.clientId || !payload.clientId.trim()) {
      throw new Error("clientId is required");
    }
    if (!payload.storeId || !payload.storeId.trim()) {
      throw new Error("storeId is required");
    }
    if (!payload.operation || !["create", "update", "delete"].includes(payload.operation)) {
      throw new Error("Valid operation ('create', 'update', 'delete') is required");
    }
    if (payload.operation === "delete" && !payload.drinkId && !payload.data?.id) {
      throw new Error("drinkId is required for deletion");
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