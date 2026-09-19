import type { MetricsGetRequest } from "./request";
import { MetricService } from "../../services/MetricService";
import { MetricMiddleware } from "../../middlewares/MetricMiddleware";

const metricService = new MetricService();

export async function metricsGetAction(payload: MetricsGetRequest) {
  MetricMiddleware.validate(payload);
  return await metricService.fetchMetrics(payload.clientId, payload.storeId);
}