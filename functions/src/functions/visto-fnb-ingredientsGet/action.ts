import type { IngredientsGetRequest } from "./request";
import { IngredientService } from "../../services/IngredientService";

const ingredientService = new IngredientService();

export async function ingredientsGetAction(payload: IngredientsGetRequest) {
  if (!payload.clientId || !payload.storeId) {
    throw new Error("clientId and storeId are required");
  }

  return await ingredientService.getIngredients(payload.clientId, payload.storeId);
}