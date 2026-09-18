import { onRequest } from "firebase-functions/v2/https";
import type { IngredientsGetRequest } from "./request";
import { ingredientsGetAction } from "./action";
import { IngredientMiddleware } from "../../middlewares/IngredientMiddleware";

export const ingredientsGet = onRequest(
  { cors: true, region: "asia-southeast1" },
  async (req, res) => {
    // Supports both POST body or GET query params
    if (req.method !== "POST" && req.method !== "GET") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    try {
      const payload: IngredientsGetRequest =
        req.method === "GET"
          ? {
              clientId: String(req.query.clientId || ""),
              storeId: String(req.query.storeId || ""),
            }
          : (req.body as IngredientsGetRequest);

      const ingredients = await ingredientsGetAction(payload);

      res.status(200).json({
        success: true,
        ingredients,
      });
    } catch (error) {
      IngredientMiddleware.handleError(res, error);
    }
  }
);