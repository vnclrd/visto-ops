import { onRequest } from "firebase-functions/v2/https";
import type { CatalogGetRequest } from "./request";
import { catalogGetAction } from "./action";
import { CatalogMiddleware } from "../../middlewares/CatalogMiddleware";

export const catalogGet = onRequest(
  { cors: true, region: "asia-southeast1" },
  async (req, res) => {
    if (req.method !== "POST" && req.method !== "GET") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    try {
      const payload: CatalogGetRequest =
        req.method === "GET"
          ? {
              clientId: String(req.query.clientId || ""),
              storeId: String(req.query.storeId || ""),
            }
          : (req.body as CatalogGetRequest);

      const catalog = await catalogGetAction(payload);

      res.status(200).json({
        success: true,
        catalog,
      });
    } catch (error) {
      CatalogMiddleware.handleError(res, error);
    }
  }
);