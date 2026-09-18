export interface BusinessAccount {
  id: string;
  businessName: string;
  email: string;
}

export interface StoreBranch {
  id: string;
  name: string;
  location: string;
  currency: string;
  ownerPin: string; // Private PIN known only to the owner
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'Espresso' | 'Non-Coffee' | 'Cold Brew' | 'Signature';
  basePrice: number;
  estimatedCost: number; // For COGS calculations in owner view
  inStock: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}