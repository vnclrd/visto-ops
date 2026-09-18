import type { LoginPayload, ClientAccount, LoginResponse } from "../types"

const BASE_URL = import.meta.env.VITE_API_URL;

export async function loginClient(payload: LoginPayload): Promise<ClientAccount> {
  const response = await fetch(`${BASE_URL}/accountLogin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data: LoginResponse = await response.json();

  if (!response.ok || !data.success || !data.account) {
    throw new Error(data.error || "Failed to sign in. Please verify credentials.");
  }

  return data.account;
}