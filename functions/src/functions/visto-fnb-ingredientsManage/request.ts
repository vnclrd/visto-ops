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
  isActive?: boolean;
}

export interface IngredientsManageRequest {
  clientId: string;
  storeId: string;
  operation: IngredientManageOperation;
  ingredientId?: string;
  data?: IngredientManagePayload;
}