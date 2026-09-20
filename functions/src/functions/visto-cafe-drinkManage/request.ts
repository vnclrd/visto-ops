import type { RecipeIngredientPayload } from "../../types";

export type DrinkManageOperation = "create" | "update" | "delete";

export interface DrinkManageDataPayload {
  id?: string;
  name?: string;
  category?: string;
  price?: number;
  cost?: number;
  recipe?: RecipeIngredientPayload[];
  isActive?: boolean;
}

export interface DrinkManageRequest {
  clientId: string;
  storeId: string;
  operation: DrinkManageOperation;
  drinkId?: string;
  data?: DrinkManageDataPayload;
}