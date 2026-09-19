import type { IngredientsManageRequest } from "./request";
import { IngredientService } from "../../services/IngredientService";
import { IngredientMiddleware } from "../../middlewares/IngredientMiddleware";

const ingredientService = new IngredientService();

export async function ingredientsManageAction(payload: IngredientsManageRequest) {
  IngredientMiddleware.validateManageRequest(payload);

  return await ingredientService.manageIngredient(
    payload.clientId,
    payload.storeId,
    payload.operation,
    payload.ingredientId,
    payload.data
  );
}