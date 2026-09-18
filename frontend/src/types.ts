export interface StoreItem {
  id: string;
  name?: string;
  location?: string;
  isActive?: boolean;
  createdAt?: string;
  businessType?: "fnb" | "retail" | "service" | string;
}

export interface ClientAccount {
  id: string;
  name: string;
  email: string;
  owner?: string;
  businessType?: "fnb" | "retail" | "service" | string;
  stores: StoreItem[];
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

export interface LoginPayload { // visto-accountLogin
  email: string;
  password: string;
}

export interface LoginResponse { // visto-accountLogin
  success: boolean;
  account?: ClientAccount;
  error?: string;
}

export interface IngredientRecord { // visto-ingredientGet
  id: string;
  name: string;
  category: "Dairy" | "Beans" | "Syrups" | "Powders" | "Packaging" | string;
  unit: "ml" | "g" | "pcs" | "shots" | string;
  currentStock: number;
  reorderLevel: number;
  packageSpecs: {
    packagePrice: number;
    packageSize: number;
  };
  costPerUnit: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}