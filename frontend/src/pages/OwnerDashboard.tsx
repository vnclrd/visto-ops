import React, { useState, useEffect } from "react";
import type { ClientAccount, StoreItem } from "../types";
import { ManageIngredientsPage } from "./IngredientsManage";
import { DrinkBuildPage } from "./DrinkBuild";
import { RestaurantMenuManagePage } from "./RestaurantMenuManage";
import { CatalogManagePage } from "./CatalogManage";
import { fetchMetrics, type MetricsResult } from "../services/metricApi";

interface OwnerDashboardProps {
  account: ClientAccount;
  store: StoreItem;
  onBackToRegister: () => void;
  onOpenGlobalDashboard: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  account,
  store,
  onBackToRegister,
  onOpenGlobalDashboard,
}) => {
  const storeCount = account.stores?.length || 0;
  const [currentView, setCurrentView] = useState<
    "overview" | "ingredients" | "DrinkBuild" | "restaurantMenu" | "catalogManage"
  >("overview");

  // Live Metrics State
  const [metrics, setMetrics] = useState<MetricsResult | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState<boolean>(true);
  const [metricError, setMetricError] = useState<string | null>(null);

  const businessType = store.businessType || account.businessType || "cafe";
  const isCafe = businessType === "cafe";
  const isRestaurant = businessType === "restaurant";
  const usesRecipeBOM = isCafe || isRestaurant;

  const loadStoreMetrics = async () => {
    setIsLoadingMetrics(true);
    setMetricError(null);
    try {
      const data = await fetchMetrics(account.id, store.id);
      setMetrics(data);
    } catch (err: any) {
      setMetricError(err.message || "Failed to load store metrics");
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  useEffect(() => {
    loadStoreMetrics();
  }, [account.id, store.id]);

  const grossSales = metrics ? metrics.todaySales : (store as any).todaySales || 0;
  const completedOrders = metrics ? metrics.todayOrders : (store as any).todayOrders || 0;

  // Sub-view 1: Ingredients & Raw Materials Management (Cafes & Restaurants)
  if (currentView === "ingredients") {
    return (
      <ManageIngredientsPage
        account={account}
        store={store}
        onBack={() => {
          setCurrentView("overview");
          loadStoreMetrics();
        }}
      />
    );
  }

  // Sub-view 2: Cafe Drink Recipe Studio
  if (currentView === "DrinkBuild") {
    return (
      <DrinkBuildPage
        account={account}
        store={store}
        onBack={() => {
          setCurrentView("overview");
          loadStoreMetrics();
        }}
      />
    );
  }

  // Sub-view 3: Restaurant Kitchen Menu & Plate Costing Studio
  if (currentView === "restaurantMenu") {
    return (
      <RestaurantMenuManagePage
        account={account}
        store={store}
        onBack={() => {
          setCurrentView("overview");
          loadStoreMetrics();
        }}
      />
    );
  }

  // Sub-view 4: General Retail Products & Direct Services
  if (currentView === "catalogManage") {
    return (
      <CatalogManagePage
        account={account}
        store={store}
        onBack={() => {
          setCurrentView("overview");
          loadStoreMetrics();
        }}
      />
    );
  }

  // Default: Overview Dashboard View
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col select-none">
      {/* Header */}
      <header className="h-14 border-b border-neutral-800 px-6 flex items-center justify-between bg-neutral-900">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg text-emerald-400">VistoOps</span>
          <span className="text-neutral-500">|</span>
          <span className="text-sm font-medium text-neutral-200">Owner Dashboard</span>
          <span className="text-xs text-neutral-400">({store.name || store.id})</span>
        </div>

        <div className="flex items-center gap-3">
          {storeCount > 1 && (
            <button
              onClick={onOpenGlobalDashboard}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-emerald-500/30 text-xs font-medium rounded transition"
            >
              View Global Dashboard &rarr;
            </button>
          )}

          <button
            onClick={onBackToRegister}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium rounded text-neutral-200 transition"
          >
            &larr; Back to Register
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">
              Store Performance Overview
            </h1>
            <p className="text-sm text-neutral-400">
              Authenticated Owner:{" "}
              <span className="text-emerald-400 font-semibold">
                {account.owner || account.name}
              </span>
            </p>
          </div>

          <button
            onClick={loadStoreMetrics}
            disabled={isLoadingMetrics}
            className="self-start sm:self-auto px-3 py-1.5 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs text-neutral-300 transition"
          >
            {isLoadingMetrics ? "Refreshing..." : "↻ Refresh Data"}
          </button>
        </div>

        {metricError && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
            {metricError}
          </div>
        )}

        {/* 3 KPI Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg">
            <p className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">
              Today's Gross Sales
            </p>
            <p className="text-3xl font-bold text-emerald-400 mt-2">
              {isLoadingMetrics ? "..." : `₱${Number(grossSales).toFixed(2)}`}
            </p>
            <p className="text-xs text-neutral-500 mt-1">Updated in real-time</p>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg">
            <p className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">
              Transactions
            </p>
            <p className="text-3xl font-bold text-white mt-2">
              {isLoadingMetrics ? "..." : completedOrders}
            </p>
            <p className="text-xs text-neutral-500 mt-1">Completed orders</p>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg">
            <p className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">
              Active Terminal
            </p>
            <p className="text-xl font-semibold text-white mt-2">
              {store.name || store.id}
            </p>
            <p className="text-xs text-emerald-500 mt-1">Online & Ready</p>
          </div>
        </div>

        {/* Action Hub */}
        <div className="border-t border-neutral-800/80 pt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
            Catalog & Inventory Management
          </h2>

          <div className={`grid gap-6 ${usesRecipeBOM ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
            {/* Card 1: Ingredients / Supplies (Rendered for Cafes & Restaurants) */}
            {usesRecipeBOM && (
              <button
                onClick={() => setCurrentView("ingredients")}
                className="p-6 bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 rounded-2xl text-left transition flex items-center justify-between group shadow-lg active:scale-[0.99]"
              >
                <div>
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold mb-3 border border-emerald-500/20 group-hover:scale-110 transition">
                    📦
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-100 group-hover:text-emerald-400 transition">
                    {isRestaurant ? "Kitchen Stock & Supplies" : "Manage Ingredients & Supplies"}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    {isRestaurant
                      ? "Track raw kitchen inventory, meat/produce units, and reorder levels."
                      : "Adjust current raw stock levels, set units, and manage reorder alerts."}
                  </p>
                </div>
                <span className="text-emerald-400 text-lg opacity-0 group-hover:opacity-100 transition translate-x-[-6px] group-hover:translate-x-0">
                  &rarr;
                </span>
              </button>
            )}

            {/* Card 2: Distinct Product / Dish Builder */}
            <button
              onClick={() => {
                if (isCafe) setCurrentView("DrinkBuild");
                else if (isRestaurant) setCurrentView("restaurantMenu");
                else setCurrentView("catalogManage");
              }}
              className="p-6 bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 rounded-2xl text-left transition flex items-center justify-between group shadow-lg active:scale-[0.99]"
            >
              <div>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold mb-3 border border-emerald-500/20 group-hover:scale-110 transition">
                  {isCafe ? "☕" : isRestaurant ? "🍽️" : "🏷️"}
                </div>
                <h3 className="text-lg font-semibold text-neutral-100 group-hover:text-emerald-400 transition">
                  {isCafe
                    ? "Manage Drinks"
                    : isRestaurant
                    ? "Manage Menu Dishes"
                    : "Manage Products"}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  {isCafe
                    ? "Compose drink recipes, map ingredient deductions, and set terminal pricing."
                    : isRestaurant
                    ? "Create recipes, map raw kitchen deductions, and monitor food cost."
                    : "Add retail inventory items, set prices, and update stock."}
                </p>
              </div>
              <span className="text-emerald-400 text-lg opacity-0 group-hover:opacity-100 transition translate-x-[-6px] group-hover:translate-x-0">
                &rarr;
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};