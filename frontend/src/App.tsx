import { useState } from "react";
import { LoginPage } from "./pages/Login";
import { StoreSelectionPage } from "./pages/StoreSelection";
import { PosTerminal } from "./pages/PosTerminal";
import { OwnerDashboard } from "./pages/OwnerDashboard";
import { OwnerGlobalDashboard } from "./pages/OwnerGlobalDashboard";
import type { ClientAccount, StoreItem } from "./types";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState<ClientAccount | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreItem | null>(null);
  const [isStoreOwnerView, setIsStoreOwnerView] = useState<boolean>(false);
  const [isGlobalOwnerView, setIsGlobalOwnerView] = useState<boolean>(false);

  const handleLogout = () => {
    setSelectedStore(null);
    setCurrentAccount(null);
    setIsStoreOwnerView(false);
    setIsGlobalOwnerView(false);
  };

  // Step 5: Global Enterprise Dashboard View
  if (currentAccount && isGlobalOwnerView) {
    return (
      <OwnerGlobalDashboard
        account={currentAccount}
        currentStore={selectedStore}
        onBack={() => setIsGlobalOwnerView(false)}
        onSelectStore={(store) => {
          setSelectedStore(store);
          setIsGlobalOwnerView(false);
          setIsStoreOwnerView(false);
        }}
      />
    );
  }

  // Step 4: Single Store Owner Dashboard View
  if (currentAccount && selectedStore && isStoreOwnerView) {
    return (
      <OwnerDashboard
        account={currentAccount}
        store={selectedStore}
        onBackToRegister={() => setIsStoreOwnerView(false)}
        onOpenGlobalDashboard={() => setIsGlobalOwnerView(true)}
      />
    );
  }

  // Step 3: POS Terminal Register
  if (currentAccount && selectedStore) {
    return (
      <PosTerminal
        account={currentAccount}
        store={selectedStore}
        onLogout={handleLogout}
        onSwitchStore={() => {
          setSelectedStore(null);
          setIsStoreOwnerView(false);
        }}
        onOpenOwnerDashboard={() => setIsStoreOwnerView(true)}
      />
    );
  }

  // Step 2: Store Selection
  if (currentAccount) {
    return (
      <div className="relative">
        <button
          onClick={handleLogout}
          className="absolute top-6 right-6 text-sm px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
        >
          Log Out
        </button>
        <StoreSelectionPage
          account={currentAccount}
          onSelectStore={(store) => setSelectedStore(store)}
          onOpenGlobalDashboard={() => setIsGlobalOwnerView(true)}
        />
      </div>
    );
  }

  // Step 1: Login
  return <LoginPage onLoginSuccess={(account) => setCurrentAccount(account)} />;
}