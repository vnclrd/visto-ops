import { useState, useEffect } from "react";
import { LoginPage } from "./pages/Login";
import { StoreSelectionPage } from "./pages/StoreSelection";
import { PosTerminal } from "./pages/PosTerminal";
import { Dashboard } from "./pages/Dashboard";
import { GlobalDashboard } from "./pages/GlobalDashboard";
import type { ClientAccount, StoreItem } from "./types";

const ACCOUNT_KEY = "visto_client_account";
const STORE_KEY = "visto_selected_store";

export default function App() {
  // Initialize state directly from localStorage so refresh keeps the user logged in
  const [currentAccount, setCurrentAccount] = useState<ClientAccount | null>(() => {
    const saved = localStorage.getItem(ACCOUNT_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  const [selectedStore, setSelectedStore] = useState<StoreItem | null>(() => {
    const saved = localStorage.getItem(STORE_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  const [isStoreOwnerView, setIsStoreOwnerView] = useState<boolean>(false);
  const [isGlobalOwnerView, setIsGlobalOwnerView] = useState<boolean>(false);

  // Sync state changes to localStorage
  const handleLoginSuccess = (account: ClientAccount) => {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
    setCurrentAccount(account);
  };

  const handleSelectStore = (store: StoreItem) => {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    setSelectedStore(store);
  };

  const handleSwitchStore = () => {
    localStorage.removeItem(STORE_KEY);
    setSelectedStore(null);
    setIsStoreOwnerView(false);
    setIsGlobalOwnerView(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(ACCOUNT_KEY);
    localStorage.removeItem(STORE_KEY);
    setSelectedStore(null);
    setCurrentAccount(null);
    setIsStoreOwnerView(false);
    setIsGlobalOwnerView(false);
  };

  // Step 5: Global Enterprise Dashboard View
  if (currentAccount && isGlobalOwnerView) {
    return (
      <GlobalDashboard
        account={currentAccount}
        currentStore={selectedStore}
        onBack={() => setIsGlobalOwnerView(false)}
        onSelectStore={(store) => {
          handleSelectStore(store);
          setIsGlobalOwnerView(false);
          setIsStoreOwnerView(false);
        }}
      />
    );
  }

  // Step 4: Single Store Owner Dashboard View
  if (currentAccount && selectedStore && isStoreOwnerView) {
    return (
      <Dashboard
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
        onSwitchStore={handleSwitchStore}
        onOpenDashboard={() => setIsStoreOwnerView(true)}
      />
    );
  }

  // Step 2: Store Selection
  if (currentAccount) {
    return (
      <div className="relative">
        <button
          onClick={handleLogout}
          className="absolute top-6 right-6 text-sm px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition z-10"
        >
          Log Out
        </button>
        <StoreSelectionPage
          account={currentAccount}
          onSelectStore={handleSelectStore}
          onOpenGlobalDashboard={() => setIsGlobalOwnerView(true)}
        />
      </div>
    );
  }

  // Step 1: Login
  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}