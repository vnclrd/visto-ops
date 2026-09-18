import React from "react";
import type { ClientAccount, StoreItem } from "../types";

interface OwnerGlobalDashboardProps {
  account: ClientAccount;
  currentStore?: StoreItem | null;
  onBack: () => void;
  onSelectStore?: (store: StoreItem) => void;
}

export const OwnerGlobalDashboard: React.FC<OwnerGlobalDashboardProps> = ({
  account,
  currentStore,
  onBack,
  onSelectStore,
}) => {
  const stores = account.stores || [];

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Consolidated Performance</h1>
          <p className="text-sm text-neutral-400">
            Owner: <span className="text-emerald-400">{account.owner || account.name}</span>
          </p>
        </div>

        {/* Aggregate KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-neutral-400 uppercase font-semibold">Total Revenue (All Stores)</p>
            <p className="text-3xl font-bold text-emerald-400 mt-2">₱0.00</p>
            <p className="text-xs text-neutral-500 mt-1">Aggregated across all branches</p>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-neutral-400 uppercase font-semibold">Combined Orders</p>
            <p className="text-3xl font-bold text-white mt-2">0</p>
            <p className="text-xs text-neutral-500 mt-1">All branch transactions</p>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-neutral-400 uppercase font-semibold">Active Branches</p>
            <p className="text-3xl font-bold text-white mt-2">{stores.length}</p>
            <p className="text-xs text-emerald-500 mt-1">Registered stores</p>
          </div>
        </div>

        {/* Store Comparison Grid */}
        <h2 className="text-lg font-semibold text-white mb-4">Branch Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <div
              key={store.id}
              className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{store.name || store.id}</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                </div>
                {store.location && (
                  <p className="text-xs text-neutral-400 mb-3">{store.location}</p>
                )}
                <div className="space-y-1 text-xs text-neutral-400 border-t border-neutral-800 pt-3">
                  <div className="flex justify-between">
                    <span>Today's Sales:</span>
                    <span className="text-white font-medium">₱0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transactions:</span>
                    <span className="text-white font-medium">0</span>
                  </div>
                </div>
              </div>

              {onSelectStore && (
                <button
                  onClick={() => onSelectStore(store)}
                  className="mt-4 w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded text-xs font-medium transition"
                >
                  Open Register &rarr;
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};