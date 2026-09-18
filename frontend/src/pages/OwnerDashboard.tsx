import React from "react";
import type { ClientAccount, StoreItem } from "../types";

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

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
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

      {/* Metrics Content */}
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Store Performance Overview</h1>
          <p className="text-sm text-neutral-400">
            Authenticated Owner: <span className="text-emerald-400">{account.owner || account.name}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-neutral-400 uppercase font-semibold">Today's Gross Sales</p>
            <p className="text-3xl font-bold text-emerald-400 mt-2">₱0.00</p>
            <p className="text-xs text-neutral-500 mt-1">Updated in real-time</p>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-neutral-400 uppercase font-semibold">Transactions</p>
            <p className="text-3xl font-bold text-white mt-2">0</p>
            <p className="text-xs text-neutral-500 mt-1">Completed orders</p>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-neutral-400 uppercase font-semibold">Active Terminal</p>
            <p className="text-xl font-semibold text-white mt-2">{store.name || store.id}</p>
            <p className="text-xs text-emerald-500 mt-1">Online & Ready</p>
          </div>
        </div>
      </main>
    </div>
  );
};