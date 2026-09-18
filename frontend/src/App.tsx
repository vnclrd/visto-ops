import { useState } from "react";
import { LoginPage } from "./pages/Login";
import type { ClientAccount } from "./services/authApi";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState<ClientAccount | null>(null);

  if (currentAccount) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <h1 className="text-white text-3xl font-semibold tracking-wide">
          Login Successful
        </h1>
      </div>
    );
  }

  return <LoginPage onLoginSuccess={(account) => setCurrentAccount(account)} />;
}