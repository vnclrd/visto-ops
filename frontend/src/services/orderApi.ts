import type { CartItem } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL;

interface OrderProcessResponse {
  success: boolean;
  result?: {
    orderId: string;
    createdAt: string;
  };
  error?: string;
}

export async function processOrder(
  clientId: string,
  storeId: string,
  items: CartItem[],
  totalAmount: number,
  cashierName: string
) {
  const response = await fetch(`${BASE_URL}/orderProcess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId,
      storeId,
      items,
      totalAmount,
      cashierName,
    }),
  });

  const data: OrderProcessResponse = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Transaction failed");
  }

  return data.result;
}