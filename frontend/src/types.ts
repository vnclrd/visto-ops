export interface StoreItem {
  id: string;
  name?: string;
  location?: string;
  isActive?: boolean;
  createdAt?: string;
  businessType?: 'cafe' | 'restaurant' | 'retail' | 'service' | string;
}

export interface ClientAccount {
  id: string;
  name: string;
  email: string;
  owner?: string;
  businessType?: 'cafe' | 'restaurant' | 'retail' | 'service' | string;
  stores: StoreItem[];
}

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
}

export interface CartItem {
  id: string;
  catalogId: string;
  name: string;
  category: string;
  price: number;
  basePrice: number;
  temperature: 'hot' | 'iced';
  size: 'regular' | 'upsized';
  upcharge: number;
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

export interface BatchRecipeIngredient {
  ingredientId: string;
  name: string;
  unit: string;
  amount: number;
  costPerUnit: number;
  totalCost: number;
}

export interface IngredientRecord {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  packageSpecs: {
    packagePrice: number;
    packageSize: number;
  };
  costPerUnit: number;
  itemType?: 'raw' | 'prepped' | 'direct';
  batchRecipe?: BatchRecipeIngredient[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  name: string;
  unit: string;
  amount: number;
  costPerUnit: number;
  totalCost: number;
}

export interface MenuItemRecord {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  recipe: RecipeIngredient[];
  emoji?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
