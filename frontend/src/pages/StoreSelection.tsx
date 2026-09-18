import React from "react";
import type { StoreItem, ClientAccount } from "../types";

interface StoreSelectionProps {
  account: ClientAccount;
  onSelectStore: (store: StoreItem) => void;
}

export const StoreSelectionPage: React.FC<StoreSelectionProps> = ({
  account,
  onSelectStore,
}) => {
  const stores = account.stores || [];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Select Store
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Logged in as <span className="font-semibold">{account.name}</span>
        </p>

        {stores.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-4">
            No active stores found for this account.
          </p>
        ) : (
          <div className="space-y-3">
            {stores.map((store) => (
              <button
                key={store.id}
                onClick={() => onSelectStore(store)}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition text-left group"
              >
                <div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600">
                    {store.name || store.id}
                  </h3>
                  {store.location && (
                    <p className="text-xs text-gray-500 mt-0.5">{store.location}</p>
                  )}
                </div>
                <span className="text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                  Select &rarr;
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};