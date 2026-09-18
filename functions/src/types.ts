export interface StoreItem { // visto-accountLogin
  id: string;
  name?: string;
  location?: string;
  isActive?: boolean;
  createdAt?: string;
  businessType?: "fnb" | "retail" | "service" | string;
}

export interface ClientAccount { // visto-accountLogin
  id: string;
  name: string;
  email: string;
  password?: string;
  pin?: string;
  owner?: string;
  businessType?: "fnb" | "retail" | "service" | string;
  stores: StoreItem[];
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