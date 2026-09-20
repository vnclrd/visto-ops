import type { RecipeIngredientPayload } from "../../types";

export type DrinkManageOperation = "create" | "update" | "delete";

export interface DrinkManagePayload {
  id?: string;
  name?: string;
  category?: string;
  price?: number;
  cost?: number;
  emoji?: string;
  recipe?: RecipeIngredientPayload[];
  isActive?: boolean;
}

export interface DrinkManageRequest {
  clientId: string;
  storeId: string;
  operation: DrinkManageOperation;
  drinkId?: string;
  data?: DrinkManagePayload;
}