import type { DrinkBuildRequest } from "./request";
import { DrinkService } from "../../services/DrinkService";
import { DrinkMiddleware } from "../../middlewares/DrinkMiddleware";

const drinkService = new DrinkService();

export async function drinkBuildAction(payload: DrinkBuildRequest) {
  DrinkMiddleware.validateBuildRequest(payload);

  return await drinkService.buildDrink(
    payload.clientId,
    payload.storeId,
    payload.operation,
    payload.drinkId,
    payload.data
  );
}