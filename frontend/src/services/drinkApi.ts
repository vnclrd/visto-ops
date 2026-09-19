import type { RecipeIngredient } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL;

export type DrinkBuildOperation = "create" | "update" | "delete";

export interface DrinkBuildPayload {
  id?: string;
  name?: string;
  category?: string;
  price?: number;
  cost?: number;
  recipe?: RecipeIngredient[];
  isActive?: boolean;
}

interface DrinkBuildResponse {
  success: boolean;
  result?: any;
  error?: string;
}

export async function manageDrink(
  clientId: string,
  storeId: string,
  operation: DrinkBuildOperation,
  drinkId?: string,
  data?: DrinkBuildPayload
): Promise<any> {
  const response = await fetch(`${BASE_URL}/drinkBuild`, {
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

  const resData: DrinkBuildResponse = await response.json();

  if (!response.ok || !resData.success) {
    throw new Error(resData.error || `Failed to ${operation} drink`);
  }

  return resData.result;
}