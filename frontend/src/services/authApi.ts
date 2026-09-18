import type { LoginPayload, ClientAccount, LoginResponse } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL;

// visto-accountLogin
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

// visto-accountVerifyPin
export async function verifyPin(clientId: string, pin: string, storeId?: string): Promise<boolean> {
  const bodyPayload = storeId 
    ? { clientId, storeId, storePin: pin }
    : { clientId, pin };

  const response = await fetch(`${BASE_URL}/accountVerifyPin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyPayload),
  });

  const data = await response.json();

  if (!response.ok || !data.success || !data.verified) {
    throw new Error(data.error || "Invalid PIN. Access denied.");
  }

  return true;
}

// Backward-compatible alias for existing calls
export const verifyOwnerPin = (clientId: string, pin: string) => verifyPin(clientId, pin);