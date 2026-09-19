import { onRequest } from "firebase-functions/v2/https";
import type { IngredientsManageRequest } from "./request";
import { ingredientsManageAction } from "./action";
import { IngredientMiddleware } from "../../middlewares/IngredientMiddleware";

export const ingredientsManage = onRequest(
  { cors: true, region: "asia-southeast1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    try {
      const payload = req.body as IngredientsManageRequest;
      const result = await ingredientsManageAction(payload);

      res.status(200).json({
        success: true,
        result,
      });
    } catch (error) {
      IngredientMiddleware.handleError(res, error);
    }
  }
);