import type { BatchRecipeIngredient } from "../../types";

export type IngredientManageOperation = "create" | "update" | "delete";

export interface IngredientManagePayload {
  id?: string;
  name?: string;
  category?: string;
  unit?: string;
  currentStock?: number;
  reorderLevel?: number;
  packageSpecs?: {
    packagePrice: number;
    packageSize: number;
  };
  itemType?: "raw" | "prepped" | "direct";
  batchRecipe?: BatchRecipeIngredient[];
  isActive?: boolean;
}

export interface IngredientsManageRequest {
  clientId: string;
  storeId: string;
  operation: IngredientManageOperation;
  ingredientId?: string;
  data?: IngredientManagePayload;
}

// Alias to prevent singular vs plural import errors across middleware/services
export type IngredientManageRequest = IngredientsManageRequest;