import { onRequest } from "firebase-functions/v2/https";
import type { DrinkManageRequest } from "./request";
import { drinkManageAction } from "./action";
import { DrinkMiddleware } from "../../middlewares/DrinkMiddleware";

export const drinkManage = onRequest(
  { cors: true, region: "asia-southeast1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    try {
      const payload = req.body as DrinkManageRequest;
      const result = await drinkManageAction(payload);

      res.status(200).json({
        success: true,
        result,
      });
    } catch (error) {
      DrinkMiddleware.handleError(res, error);
    }
  }
);