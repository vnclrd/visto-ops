import React, { useState } from "react";
import type { ClientAccount, StoreItem } from "../types";
import { ManageIngredientsPage } from "./ManageIngredients";
import { BuildDrinkPage } from "./BuildDrink";

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
  const [currentView, setCurrentView] = useState<"overview" | "ingredients" | "buildDrink">("overview");

  const businessType = store.businessType || account.businessType || "fnb";
  const isFnB = businessType === "fnb";

  // Sub-view 1: Ingredients Management
  if (currentView === "ingredients") {
    return (
      <ManageIngredientsPage
        account={account}
        store={store}
        onBack={() => setCurrentView("overview")}
      />
    );
  }

  // Sub-view 2: Drink Builder Studio
  if (currentView === "buildDrink") {
    return (
      <BuildDrinkPage
        account={account}
        store={store}
        onBack={() => setCurrentView("overview")}
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
        <div className="mb-6">
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

        {/* 3 KPI Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg">
            <p className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">
              Today's Gross Sales
            </p>
            <p className="text-3xl font-bold text-emerald-400 mt-2">₱0.00</p>
            <p className="text-xs text-neutral-500 mt-1">Updated in real-time</p>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg">
            <p className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">
              Transactions
            </p>
            <p className="text-3xl font-bold text-white mt-2">0</p>
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

          <div className={`grid gap-6 ${isFnB ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
            {isFnB && (
              <button
                onClick={() => setCurrentView("ingredients")}
                className="p-6 bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 rounded-2xl text-left transition flex items-center justify-between group shadow-lg active:scale-[0.99]"
              >
                <div>
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold mb-3 border border-emerald-500/20 group-hover:scale-110 transition">
                    📦
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-100 group-hover:text-emerald-400 transition">
                    Update Ingredients & Supplies
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Adjust current raw stock levels, set units, and manage reorder alerts.
                  </p>
                </div>
                <span className="text-emerald-400 text-lg opacity-0 group-hover:opacity-100 transition translate-x-[-6px] group-hover:translate-x-0">
                  &rarr;
                </span>
              </button>
            )}

            <button
              onClick={() => setCurrentView("buildDrink")}
              className="p-6 bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 rounded-2xl text-left transition flex items-center justify-between group shadow-lg active:scale-[0.99]"
            >
              <div>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold mb-3 border border-emerald-500/20 group-hover:scale-110 transition">
                  {isFnB ? "☕" : "🏷️"}
                </div>
                <h3 className="text-lg font-semibold text-neutral-100 group-hover:text-emerald-400 transition">
                  {isFnB ? "Build a Drink" : "Manage Products"}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  {isFnB
                    ? "Compose drink recipes, map ingredient deductions, and set terminal pricing."
                    : "Add retail items, adjust selling prices, and maintain inventory."}
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