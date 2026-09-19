import type { DrinkManageRequest } from "./request";
import { DrinkService } from "../../services/DrinkService";
import { DrinkMiddleware } from "../../middlewares/DrinkMiddleware";

const drinkService = new DrinkService();

export async function drinkManageAction(payload: DrinkManageRequest) {
  DrinkMiddleware.validateManageRequest(payload);

  return await drinkService.manageDrink(
    payload.clientId,
    payload.storeId,
    payload.operation,
    payload.drinkId,
    payload.data
  );
}