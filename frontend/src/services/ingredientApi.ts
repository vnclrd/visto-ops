import type { IngredientRecord } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL;

interface IngredientsGetResponse {
  success: boolean;
  ingredients?: IngredientRecord[];
  error?: string;
}

export async function fetchIngredients(
  clientId: string,
  storeId: string
): Promise<IngredientRecord[]> {
  const response = await fetch(`${BASE_URL}/ingredientsGet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ clientId, storeId }),
  });

  const data: IngredientsGetResponse = await response.json();

  if (!response.ok || !data.success || !data.ingredients) {
    throw new Error(data.error || "Failed to load ingredients");
  }

  return data.ingredients;
}