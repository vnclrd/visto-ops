import { useState } from "react";
import { LoginPage } from "./pages/Login";
import { StoreSelectionPage } from "./pages/StoreSelection";
import type { ClientAccount, StoreItem } from "./types";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState<ClientAccount | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreItem | null>(null);

  // Step 3: Store chosen screen
  if (selectedStore) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-semibold tracking-wide mb-2">
          Chosen store
        </h1>
        <p className="text-gray-400 text-sm">
          {selectedStore.name || selectedStore.id}
        </p>
      </div>
    );
  }

  // Step 2: Store selection screen
  if (currentAccount) {
    return (
      <StoreSelectionPage
        account={currentAccount}
        onSelectStore={(store) => setSelectedStore(store)}
      />
    );
  }

  // Step 1: Login screen
  return <LoginPage onLoginSuccess={(account) => setCurrentAccount(account)} />;
}