export interface StoreItem { // visto-accountLogin
  id: string;
  name?: string;
  location?: string;
  isActive?: boolean;
  createdAt?: string;
  businessType?: "cafe" | "restaurant" | "retail" | "service" | string;
}

export interface ClientAccount { // visto-accountLogin
  id: string;
  name: string;
  email: string;
  password?: string;
  pin?: string;
  owner?: string;
  businessType?: "cafe" | "restaurant" | "retail" | "service" | string;
  stores: StoreItem[];
}

export interface VerifyPinResult { // visto-accountVerifyPin
  verified: boolean;
}

export interface BatchRecipeIngredient {
  ingredientId: string;
  name: string;
  unit: string;
  amount: number;
  costPerUnit: number;
  totalCost: number;
}

export interface IngredientRecord { // visto-cafe-ingredientsGet
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
  itemType?: "raw" | "prepped" | "direct";
  batchRecipe?: BatchRecipeIngredient[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeIngredientPayload { // visto-cafe-drinkBuild
  ingredientId: string;
  name: string;
  unit: string;
  amount: number;
  costPerUnit: number;
  totalCost: number;
}

export interface MenuItemRecord { // visto-cafe-drinkBuild
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

export interface CartOrderItem { // visto-orderProcess
  id: string;
  catalogId: string;
  name: string;
  category: string;
  price: number;
  basePrice: number;
  temperature: "hot" | "iced";
  size: "regular" | "upsized";
  upcharge: number;
  quantity: number;
}

export interface OrderRecord { // visto-orderProcess
  id?: string;
  items: CartOrderItem[];
  totalAmount: number;
  cashierName: string;
  dateKey: string;
  createdAt: string;
}

export interface StoreMetrics { // visto-metricsGet
  storeId: string;
  storeName: string;
  todaySales: number;
  todayOrders: number;
  totalSales: number;
  totalOrders: number;
  isActive: boolean;
}

export interface MetricsGetResponse { // visto-metricsGet
  todaySales: number;
  todayOrders: number;
  totalSales: number;
  totalOrders: number;
  activeBranchesCount?: number;
  totalBranchesCount?: number;
  stores?: StoreMetrics[];
}