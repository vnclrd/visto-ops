import type { IngredientRecord, BatchRecipeIngredient } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL;

interface IngredientsGetResponse {
  success: boolean;
  ingredients?: IngredientRecord[];
  error?: string;
}

interface IngredientsManageResponse {
  success: boolean;
  result?: any;
  error?: string;
}

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

export async function fetchIngredients(
  clientId: string,
  storeId: string
): Promise<IngredientRecord[]> {
  const response = await fetch(`${BASE_URL}/ingredientsGet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, storeId }),
  });

  const data: IngredientsGetResponse = await response.json();
  if (!response.ok || !data.success || !data.ingredients) {
    throw new Error(data.error || "Failed to load ingredients");
  }
  return data.ingredients;
}

export async function manageIngredient(
  clientId: string,
  storeId: string,
  operation: IngredientManageOperation,
  ingredientId?: string,
  data?: IngredientManagePayload
): Promise<any> {
  const response = await fetch(`${BASE_URL}/ingredientsManage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId,
      storeId,
      operation,
      ingredientId,
      data,
    }),
  });

  const resData: IngredientsManageResponse = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.error || `Failed to ${operation} ingredient`);
  }
  return resData.result;
}