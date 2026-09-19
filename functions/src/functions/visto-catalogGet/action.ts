import type { CatalogGetRequest } from "./request";
import { CatalogService } from "../../services/CatalogService";
import { CatalogMiddleware } from "../../middlewares/CatalogMiddleware";

const catalogService = new CatalogService();

export async function catalogGetAction(payload: CatalogGetRequest) {
  CatalogMiddleware.validateGetRequest(payload.clientId, payload.storeId);
  return await catalogService.getCatalog(payload.clientId, payload.storeId);
}