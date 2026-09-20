import type { RecipeIngredient } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL;

export type DrinkManageOperation = "create" | "update" | "delete";

export interface DrinkManagePayload {
  id?: string;
  name?: string;
  category?: string;
  price?: number;
  cost?: number;
  emoji?: string;
  recipe?: RecipeIngredient[];
  isActive?: boolean;
}

interface DrinkManageResponse {
  success: boolean;
  result?: any;
  error?: string;
}

export async function manageDrink(
  clientId: string,
  storeId: string,
  operation: DrinkManageOperation,
  drinkId?: string,
  data?: DrinkManagePayload
): Promise<any> {
  const response = await fetch(`${BASE_URL}/drinkManage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientId,
      storeId,
      operation,
      drinkId,
      data,
    }),
  });

  const resData: DrinkManageResponse = await response.json();

  if (!response.ok || !resData.success) {
    throw new Error(resData.error || `Failed to ${operation} drink`);
  }

  return resData.result;
}