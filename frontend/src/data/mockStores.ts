import type { BusinessAccount, StoreBranch, MenuItem } from '../types/store';

export const MOCK_BUSINESS: BusinessAccount = {
  id: 'biz_gatcha',
  businessName: 'Gatcha Coffee Co.',
  email: 'ops@gatchacoffee.com',
};

export const MOCK_BRANCHES: StoreBranch[] = [
  {
    id: 'branch_downtown',
    name: 'Gatcha Coffee - Downtown',
    location: 'Main St. Branch',
    currency: '₱',
    ownerPin: '8888', // Owner PIN for this store
  },
  {
    id: 'branch_mall',
    name: 'Gatcha Kiosk - Mall Express',
    location: 'Ground Floor, North Mall',
    currency: '₱',
    ownerPin: '9999',
  },
];

export const MOCK_MENUS: Record<string, MenuItem[]> = {
  branch_downtown: [
    { id: 'item_1', name: 'Iced Americano', category: 'Espresso', basePrice: 120, estimatedCost: 28, inStock: true },
    { id: 'item_2', name: 'Spanish Latte', category: 'Espresso', basePrice: 150, estimatedCost: 45, inStock: true },
    { id: 'item_3', name: 'Caramel Macchiato', category: 'Espresso', basePrice: 165, estimatedCost: 52, inStock: true },
    { id: 'item_4', name: 'Matcha Cloud Latte', category: 'Non-Coffee', basePrice: 170, estimatedCost: 60, inStock: true },
    { id: 'item_5', name: 'Sweet Cold Brew', category: 'Cold Brew', basePrice: 140, estimatedCost: 35, inStock: true },
    { id: 'item_6', name: 'Sea Salt Latte', category: 'Signature', basePrice: 180, estimatedCost: 58, inStock: false },
  ],
  branch_mall: [
    { id: 'item_1', name: 'Iced Americano', category: 'Espresso', basePrice: 110, estimatedCost: 28, inStock: true },
    { id: 'item_2', name: 'Spanish Latte', category: 'Espresso', basePrice: 140, estimatedCost: 45, inStock: true },
    { id: 'item_7', name: 'Cold Brew Concentrate', category: 'Cold Brew', basePrice: 130, estimatedCost: 32, inStock: true },
    { id: 'item_8', name: 'Classic Chocolate', category: 'Non-Coffee', basePrice: 130, estimatedCost: 40, inStock: true },
  ],
};