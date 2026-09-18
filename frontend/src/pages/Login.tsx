import React, { useState } from "react";
import { loginClient } from "../services/authApi";
import type { ClientAccount } from "../types";

interface LoginProps {
  onLoginSuccess: (account: ClientAccount) => void;
}

export const LoginPage: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("miguel.calarde@gmail.com");
  const [password, setPassword] = useState("VistoOps123");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const account = await loginClient({ email, password });
      onLoginSuccess(account);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 select-none">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900 p-8 border border-neutral-800 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-2xl mb-3">
            V
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            VistoOps POS
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Sign in with your enterprise credentials
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition"
              placeholder="user@vistoops.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 py-2.5 px-4 text-sm font-semibold text-black transition disabled:opacity-50 active:scale-[0.99]"
          >
            {isLoading ? "Signing in..." : "Sign In to Terminal"}
          </button>
        </form>
      </div>
    </div>
  );
};