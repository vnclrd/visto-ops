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
  stores?: StoreItem[];
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