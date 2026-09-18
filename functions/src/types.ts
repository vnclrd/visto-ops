export interface StoreItem {
  id: string;
  name: string;
  location?: string;
  isActive: boolean;
}

export interface ClientAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  owner?: string;
  pin?: string;
  stores?: StoreItem[];
}

export interface VerifyPinResult {
  verified: boolean;
}