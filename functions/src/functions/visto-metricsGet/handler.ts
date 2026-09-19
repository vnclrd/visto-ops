import { onRequest } from "firebase-functions/v2/https";
import type { MetricsGetRequest } from "./request";
import { metricsGetAction } from "./action";
import { MetricMiddleware } from "../../middlewares/MetricMiddleware";

export const metricsGet = onRequest(
  { cors: true, region: "asia-southeast1" },
  async (req, res) => {
    if (req.method !== "POST" && req.method !== "GET") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    try {
      const payload: MetricsGetRequest =
        req.method === "GET"
          ? {
              clientId: String(req.query.clientId || ""),
              storeId: req.query.storeId ? String(req.query.storeId) : undefined,
            }
          : (req.body as MetricsGetRequest);

      const metrics = await metricsGetAction(payload);

      res.status(200).json({
        success: true,
        metrics,
      });
    } catch (error) {
      MetricMiddleware.handleError(res, error);
    }
  }
);