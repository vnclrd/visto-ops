import { MetricRepository } from "../repositories/MetricRepository";
import type { MetricsGetResponse } from "../types";

export class MetricService {
  constructor(private repo = new MetricRepository()) {}

  async fetchMetrics(clientId: string, storeId?: string): Promise<MetricsGetResponse> {
    if (storeId && storeId.trim()) {
      return await this.repo.getStoreMetrics(clientId, storeId);
    }
    return await this.repo.getGlobalMetrics(clientId);
  }
}