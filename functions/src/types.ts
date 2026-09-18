export interface StoreItem { // visto-accountLogin
  id: string;
  name: string;
  location?: string;
  isActive: boolean;
}

export interface ClientAccount { // visto-accountLogin
  id: string;
  name: string;
  email: string;
  password: string;
  owner?: string;
  pin?: string;
  stores?: StoreItem[];
}

export interface VerifyPinResult { // visto-accountVerifyPin
  verified: boolean;
}

export interface IngredientRecord { // visto-ingredientsGet
  id: string;
  name: string;
  category: string;
  costPerUnit: number;
  currentStock: number;
  unit: string;
  reorderLevel: number;
  packageSpecs: {
    packagePrice: number;
    packageSize: number;
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}