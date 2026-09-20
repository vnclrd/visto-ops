export interface BusinessEmojiConfig {
  defaultEmoji: string;
  palette: string[];
  categoryDefaults: Record<string, string>;
}

export const BUSINESS_EMOJI_PRESETS: Record<string, BusinessEmojiConfig> = {
  cafe: {
    defaultEmoji: "☕",
    palette: [
      "☕", "🧋", "🍵", "🥤", "🍹", "🥛", "🍋", "🍫", "🧊", "🥥", "🍓", "🍯"
    ],
    categoryDefaults: {
      Espresso: "☕",
      "Milk Tea": "🧋",
      Matcha: "🍵",
      "Non-Coffee": "🍹",
      Frappe: "🥤",
    },
  },

  restaurant: {
    defaultEmoji: "🍽️",
    palette: [
      "🍽️", "🥩", "🍗", "🍚", "🍲", "🥗", "🍝", "🍳", "🥪", "🍟", "🍰", "🥟"
    ],
    categoryDefaults: {
      Mains: "🥩",
      Appetizers: "🥟",
      Pasta: "🍝",
      Sides: "🍟",
      Desserts: "🍰",
      Beverages: "🥤",
    },
  },

  // Expanded Retail: Sari-sari stores, vape shops, convenience & general merchandise
  retail: {
    defaultEmoji: "🛍️",
    palette: [
      // Vape & Smoke Essentials
      "💨", "🔋", "🔌", "🧪", "🚬",
      // Sari-sari / Pantry / Groceries
      "🥫", "🍜", "🍞", "🥚", "🍚", "🍬", "🍿", "🍫", "🧃", "🧊", "🍾",
      // Toiletries / Cleaning / Home Essentials
      "🧼", "🧴", "🪥", "🧻", "🧹",
      // General Retail / Merchandise
      "🛍️", "🏷️", "📦", "👕", "🔋", "💡"
    ],
    categoryDefaults: {
      // Vape / Smoke Categories
      "Vape": "💨",
      "Vapes": "💨",
      "Pods": "🧪",
      "Pod": "🧪",
      "Disposables": "💨",
      "Juice": "🧪",
      "E-Liquid": "🧪",
      "Coils & Accessories": "🔌",
      "Batteries": "🔋",
      "Tobacco & Cigarettes": "🚬",
      "Cigarettes": "🚬",

      // Sari-Sari & Grocery Categories
      "Canned Goods": "🥫",
      "Noodles & Instant": "🍜",
      "Snacks & Candies": "🍿",
      "Chips": "🍿",
      "Sweets": "🍬",
      "Bread & Bakery": "🍞",
      "Rice & Grains": "🍚",
      "Eggs": "🥚",
      "Beverages & Drinks": "🧃",
      "Softdrinks": "🧃",
      "Liquor & Beer": "🍾",
      "Ice": "🧊",

      // Toiletries & Sundries
      "Toiletries & Hygiene": "🧼",
      "Soap & Shampoo": "🧴",
      "Household Cleaning": "🧹",
      "General": "🛍️",
      "Merchandise": "🏷️",
    },
  },

  service: {
    defaultEmoji: "🛠️",
    palette: [
      "🛠️", "🧺", "🧼", "✂️", "🔧", "🧹", "🧰", "📋", "🚗", "🚿"
    ],
    categoryDefaults: {
      Cleaning: "🧹",
      Laundry: "🧺",
      Repair: "🔧",
      General: "🛠️",
    },
  },
};

export function getBusinessEmojiConfig(businessType?: string): BusinessEmojiConfig {
  return BUSINESS_EMOJI_PRESETS[businessType || "cafe"] || BUSINESS_EMOJI_PRESETS.retail;
}