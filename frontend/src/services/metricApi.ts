const BASE_URL = import.meta.env.VITE_API_URL;

export interface StoreMetricDetail {
  storeId: string;
  storeName: string;
  todaySales: number;
  todayOrders: number;
  totalSales: number;
  totalOrders: number;
  isActive: boolean;
}

export interface MetricsResult {
  todaySales: number;
  todayOrders: number;
  totalSales: number;
  totalOrders: number;
  activeBranchesCount?: number;
  totalBranchesCount?: number;
  stores?: StoreMetricDetail[];
}

export async function fetchMetrics(clientId: string, storeId?: string): Promise<MetricsResult> {
  const response = await fetch(`${BASE_URL}/metricsGet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, storeId }),
  });

  const data = await response.json();
  if (!response.ok || !data.success || !data.metrics) {
    throw new Error(data.error || "Failed to load metrics");
  }

  return data.metrics;
}