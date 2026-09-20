import type { Response } from 'express';
import type { IngredientsManageRequest } from '../functions/visto-cafe-ingredientsManage/request';

export class IngredientMiddleware {
  // visto-accountVerifyPin
  static validateManageRequest(payload: IngredientsManageRequest) {
    if (!payload.clientId || !payload.clientId.trim()) {
      throw new Error('clientId is required');
    }
    if (!payload.storeId || !payload.storeId.trim()) {
      throw new Error('storeId is required');
    }
    if (
      !payload.operation ||
      !['create', 'update', 'delete'].includes(payload.operation)
    ) {
      throw new Error(
        "Valid operation ('create', 'update', 'delete') is required",
      );
    }
  }

  // visto-ingredientManage
  static handleError(res: Response, error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal Server Error';
    res.status(400).json({
      success: false,
      error: message,
    });
  }
}
