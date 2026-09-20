import React, { useState, useEffect } from "react";
import type { ClientAccount, StoreItem } from "../types";
import { fetchMetrics, type MetricsResult } from "../services/metricApi";

interface GlobalDashboardProps {
  account: ClientAccount;
  currentStore?: StoreItem | null;
  onBack: () => void;
  onSelectStore?: (store: StoreItem) => void;
}

export const GlobalDashboard: React.FC<GlobalDashboardProps> = ({
  account,
  currentStore,
  onBack,
  onSelectStore,
}) => {
  const rawStores = account.stores || [];

  const [metrics, setMetrics] = useState<MetricsResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadGlobalMetrics = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await fetchMetrics(account.id);
      setMetrics(data);
    } catch (err: any) {
      setFetchError(err.message || "Failed to load global metrics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGlobalMetrics();
  }, [account.id]);

  // Aggregate Metrics derived from API response or fallback calculation
  const aggregateRevenue = metrics
    ? metrics.todaySales
    : rawStores.reduce((acc, s: any) => acc + (Number(s.todaySales) || 0), 0);

  const aggregateOrders = metrics
    ? metrics.todayOrders
    : rawStores.reduce((acc, s: any) => acc + (Number(s.todayOrders) || 0), 0);

  const activeBranchesCount = metrics?.activeBranchesCount ?? rawStores.filter((s) => s.isActive !== false).length;

  // Sort stores: active first, then oldest createdAt ascending, inactive at the bottom
  const sortedStores = [...rawStores].sort((a, b) => {
    const aActive = a.isActive !== false;
    const bActive = b.isActive !== false;

    if (aActive !== bActive) {
      return Number(bActive) - Number(aActive);
    }

    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    return aTime - bTime;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col select-none">
      {/* Header */}
      <header className="h-14 border-b border-neutral-800 px-6 flex items-center justify-between bg-neutral-900">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg text-emerald-400">VistoOps</span>
          <span className="text-neutral-500">|</span>
          <span className="text-sm font-medium text-neutral-200">
            Global Enterprise Dashboard
          </span>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium rounded text-neutral-200 transition"
        >
          &larr; {currentStore ? `Back to ${currentStore.name || currentStore.id}` : "Back to Stores"}
        </button>
      </header>

      {/* Global Metrics Content */}
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Consolidated Performance</h1>
            <p className="text-sm text-neutral-400">
              Owner: <span className="text-emerald-400 font-semibold">{account.owner || account.name}</span>
            </p>
          </div>

          <button
            onClick={loadGlobalMetrics}
            disabled={isLoading}
            className="self-start sm:self-auto px-3 py-1.5 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs text-neutral-300 transition"
          >
            {isLoading ? "Refreshing..." : "↻ Refresh Data"}
          </button>
        </div>

        {fetchError && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
            {fetchError}
          </div>
        )}

        {/* Aggregate KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg">
            <p className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">
              Total Revenue (All Stores)
            </p>
            <p className="text-3xl font-bold text-emerald-400 mt-2">
              {isLoading ? "..." : `₱${aggregateRevenue.toFixed(2)}`}
            </p>
            <p className="text-xs text-neutral-500 mt-1">Aggregated across all branches</p>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg">
            <p className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">
              Combined Orders
            </p>
            <p className="text-3xl font-bold text-white mt-2">
              {isLoading ? "..." : aggregateOrders}
            </p>
            <p className="text-xs text-neutral-500 mt-1">All branch transactions</p>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg">
            <p className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">
              Active Branches
            </p>
            <p className="text-3xl font-bold text-white mt-2">
              {activeBranchesCount}{" "}
              <span className="text-xs text-neutral-500 font-normal">/ {rawStores.length}</span>
            </p>
            <p className="text-xs text-emerald-500 mt-1">Operational stores</p>
          </div>
        </div>

        {/* Store Comparison Grid */}
        <h2 className="text-lg font-semibold text-white mb-4">Branch Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedStores.map((storeItem) => {
            const isActive = storeItem.isActive !== false;

            // Resolve real-time numbers from API if available, else fall back to local store record
            const liveStoreMetric = metrics?.stores?.find((m) => m.storeId === storeItem.id);
            const branchTodaySales = liveStoreMetric
              ? liveStoreMetric.todaySales
              : (storeItem as any).todaySales || 0;
            const branchTodayOrders = liveStoreMetric
              ? liveStoreMetric.todayOrders
              : (storeItem as any).todayOrders || 0;

            return (
              <div
                key={storeItem.id}
                className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                  isActive
                    ? "bg-neutral-900 border-neutral-800 shadow-md"
                    : "bg-neutral-900/50 border-neutral-900 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold ${isActive ? "text-white" : "text-neutral-400"}`}>
                      {storeItem.name || storeItem.id}
                    </h3>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-neutral-800 text-neutral-400 border-neutral-700"
                      }`}
                    >
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {storeItem.location && (
                    <p className="text-xs text-neutral-400 mb-3">{storeItem.location}</p>
                  )}

                  <div className="space-y-1 text-xs text-neutral-400 border-t border-neutral-800 pt-3">
                    <div className="flex justify-between">
                      <span>Today's Sales:</span>
                      <span className={isActive ? "text-white font-medium" : "text-neutral-500"}>
                        {isLoading ? "..." : `₱${Number(branchTodaySales).toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transactions:</span>
                      <span className={isActive ? "text-white font-medium" : "text-neutral-500"}>
                        {isLoading ? "..." : branchTodayOrders}
                      </span>
                    </div>
                  </div>
                </div>

                {onSelectStore && (
                  <button
                    onClick={() => isActive && onSelectStore(storeItem)}
                    disabled={!isActive}
                    className={`mt-4 w-full py-2 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white"
                        : "bg-neutral-900 text-neutral-600 cursor-not-allowed border border-neutral-800/50"
                    }`}
                  >
                    {isActive ? "Open Register \u2192" : "Branch Inactive"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};