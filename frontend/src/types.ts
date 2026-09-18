export interface StoreItem {
  id: string;
  name?: string;
  location?: string;
  currency?: string;
  isActive?: boolean;
}

export interface ClientAccount {
  id: string;
  name: string;
  email: string;
  owner?: string;
  pin?: string;
  stores?: StoreItem[];
}

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
}

export interface CartItem extends CatalogItem {
  quantity: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  account?: ClientAccount;
  error?: string;
}