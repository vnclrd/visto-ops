import type { RecipeIngredientPayload } from "../../types";

export type DrinkBuildOperation = "create" | "update" | "delete";

export interface DrinkBuildDataPayload {
  id?: string;
  name?: string;
  category?: string;
  price?: number;
  cost?: number;
  recipe?: RecipeIngredientPayload[];
  isActive?: boolean;
}

export interface DrinkBuildRequest {
  clientId: string;
  storeId: string;
  operation: DrinkBuildOperation;
  drinkId?: string;
  data?: DrinkBuildDataPayload;
}