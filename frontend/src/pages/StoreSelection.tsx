import React, { useState } from "react";
import type { StoreItem, ClientAccount } from "../types";
import { verifyPin } from "../services/authApi";

interface StoreSelectionProps {
  account: ClientAccount;
  onSelectStore: (store: StoreItem) => void;
  onOpenGlobalDashboard: () => void;
}

type ModalType = "store" | "owner" | null;

export const StoreSelectionPage: React.FC<StoreSelectionProps> = ({
  account,
  onSelectStore,
  onOpenGlobalDashboard,
}) => {
  const stores = account.stores || [];

  const [modalType, setModalType] = useState<ModalType>(null);
  const [targetStore, setTargetStore] = useState<StoreItem | null>(null);
  const [enteredPin, setEnteredPin] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const openStorePinModal = (store: StoreItem) => {
    setTargetStore(store);
    setPinError(null);
    setEnteredPin("");
    setModalType("store");
  };

  const openOwnerPinModal = () => {
    setTargetStore(null);
    setPinError(null);
    setEnteredPin("");
    setModalType("owner");
  };

  const closeModal = () => {
    setModalType(null);
    setTargetStore(null);
    setEnteredPin("");
    setPinError(null);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setIsLoading(true);

    try {
      if (modalType === "store" && targetStore) {
        // Verifies storePin for this store document
        await verifyPin(account.id, enteredPin, targetStore.id);
        closeModal();
        onSelectStore(targetStore);
      } else if (modalType === "owner") {
        // Verifies owner pin
        await verifyPin(account.id, enteredPin);
        closeModal();
        onOpenGlobalDashboard();
      }
    } catch (err: any) {
      setPinError(err.message || "Invalid PIN");
      setEnteredPin("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 select-none relative">
      <div className="w-full max-w-lg rounded-2xl bg-neutral-900 p-8 border border-neutral-800 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white tracking-wide">
            Select Store
          </h2>
          {stores.length > 1 && (
            <button
              onClick={openOwnerPinModal}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
            >
              Global Dashboard &rarr;
            </button>
          )}
        </div>

        <p className="text-xs text-neutral-400 mb-6">
          Logged in as <span className="text-neutral-200 font-semibold">{account.name}</span>
        </p>

        {stores.length === 0 ? (
          <div className="p-6 text-center bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-500">
            No active stores found for this account.
          </div>
        ) : (
          <div className="space-y-3">
            {stores.map((store) => (
              <button
                key={store.id}
                onClick={() => openStorePinModal(store)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800 hover:border-neutral-700 transition text-left group"
              >
                <div>
                  <h3 className="font-semibold text-neutral-200 group-hover:text-emerald-400 transition">
                    {store.name || store.id}
                  </h3>
                  {store.location && (
                    <p className="text-xs text-neutral-400 mt-0.5">{store.location}</p>
                  )}
                </div>
                <span className="text-xs font-semibold text-emerald-400 opacity-0 group-hover:opacity-100 transition translate-x-[-4px] group-hover:translate-x-0">
                  Launch &rarr;
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Unified Verification Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-sm w-full p-6 shadow-2xl text-white">
            <h3 className="text-lg font-semibold text-center mb-1">
              {modalType === "store" ? "Store Access Verification" : "Owner Verification"}
            </h3>
            <p className="text-xs text-neutral-400 text-center mb-4">
              {modalType === "store"
                ? `Enter store PIN for ${targetStore?.name || targetStore?.id}`
                : "Enter PIN to access Enterprise Global Dashboard"}
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
                  onClick={closeModal}
                  className="w-1/2 py-2 text-xs bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-1/2 py-2 text-xs bg-emerald-500 hover:bg-emerald-400 rounded text-black font-semibold transition disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "Confirm PIN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};