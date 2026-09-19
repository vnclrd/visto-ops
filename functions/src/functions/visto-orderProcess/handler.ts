import { onRequest } from "firebase-functions/v2/https";
import type { OrderProcessRequest } from "./request";
import { orderProcessAction } from "./action";
import { OrderMiddleware } from "../../middlewares/OrderMiddleware";

export const orderProcess = onRequest(
  { cors: true, region: "asia-southeast1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    try {
      const payload = req.body as OrderProcessRequest;
      const result = await orderProcessAction(payload);

      res.status(200).json({
        success: true,
        result,
      });
    } catch (error) {
      OrderMiddleware.handleError(res, error);
    }
  }
);