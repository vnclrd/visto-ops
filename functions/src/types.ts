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

export interface IngredientRecord { // visto-fnb-ingredientsGet
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

export interface RecipeIngredientPayload { // visto-fnb-drinkBuild
  ingredientId: string;
  name: string;
  unit: string;
  amount: number;
  costPerUnit: number;
  totalCost: number;
}

export interface MenuItemRecord { // visto-fnb-drinkBuild
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  recipe: RecipeIngredientPayload[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}