import type { MenuItemRecord } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL;

interface CatalogGetResponse {
  success: boolean;
  catalog?: MenuItemRecord[];
  error?: string;
}

export async function fetchCatalog(
  clientId: string,
  storeId: string
): Promise<MenuItemRecord[]> {
  const response = await fetch(`${BASE_URL}/catalogGet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, storeId }),
  });

  const data: CatalogGetResponse = await response.json();
  if (!response.ok || !data.success || !data.catalog) {
    throw new Error(data.error || "Failed to load store catalog");
  }

  return data.catalog;
}