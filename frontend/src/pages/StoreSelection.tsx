import React, { useState } from "react";
import type { StoreItem, ClientAccount } from "../types";
import { verifyOwnerPin } from "../services/authApi";

interface StoreSelectionProps {
  account: ClientAccount;
  onSelectStore: (store: StoreItem) => void;
  onOpenGlobalDashboard: () => void;
}

export const StoreSelectionPage: React.FC<StoreSelectionProps> = ({
  account,
  onSelectStore,
  onOpenGlobalDashboard,
}) => {
  const stores = account.stores || [];

  // PIN Modal State
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    try {
      await verifyOwnerPin(account.id, enteredPin);
      setShowPinModal(false);
      setEnteredPin("");
      onOpenGlobalDashboard();
    } catch (err: any) {
      setPinError(err.message || "Invalid PIN");
      setEnteredPin("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 relative">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Select Store</h2>
          {stores.length > 1 && (
            <button
              onClick={() => {
                setPinError(null);
                setEnteredPin("");
                setShowPinModal(true);
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
            >
              Global Dashboard &rarr;
            </button>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-6">
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

      {/* PIN Verification Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-sm w-full p-6 shadow-xl text-white">
            <h3 className="text-lg font-semibold text-center mb-1">
              Owner Verification
            </h3>
            <p className="text-xs text-neutral-400 text-center mb-4">
              Enter PIN to access the Enterprise Global Dashboard
            </p>

            {pinError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded p-2 text-center mb-4">
                {pinError}
              </div>
            )}

            <form onSubmit={handlePinSubmit}>
              <input
                type="password"
                maxLength={6}
                autoFocus
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="Enter PIN"
                className="w-full text-center tracking-widest text-xl py-2 px-3 bg-neutral-950 border border-neutral-700 rounded-lg text-white mb-4 focus:outline-none focus:border-emerald-500"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="w-1/2 py-2 text-xs bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 text-xs bg-emerald-500 hover:bg-emerald-400 rounded text-black font-semibold transition"
                >
                  Confirm PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};