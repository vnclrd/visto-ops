import React, { useState, useEffect } from "react";
import type { ClientAccount, StoreItem, MenuItemRecord } from "../types";
import { fetchCatalog } from "../services/catalogApi";
import { manageDrink } from "../services/drinkApi";
import { getBusinessEmojiConfig } from "../utils/emojiPresets";

interface CatalogManageProps {
  account: ClientAccount;
  store: StoreItem;
  onBack: () => void;
}

export const CatalogManagePage: React.FC<CatalogManageProps> = ({
  account,
  store,
  onBack,
}) => {
  const [items, setItems] = useState<MenuItemRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const businessType = store.businessType || account.businessType || "retail";
  const emojiConfig = getBusinessEmojiConfig(businessType);

  // Form State (Creation / Editing)
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("General");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCost, setItemCost] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState<string>(emojiConfig.defaultEmoji);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await fetchCatalog(account.id, store.id);
      setItems(data);
    } catch (err: any) {
      setFetchError(err.message || "Failed to load catalog items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [account.id, store.id]);

  const handleCategoryChange = (newCat: string) => {
    setItemCategory(newCat);
    setSelectedEmoji(emojiConfig.categoryDefaults[newCat] || emojiConfig.defaultEmoji);
  };

  const handleResetForm = () => {
    setEditingItemId(null);
    setItemName("");
    setItemCategory("General");
    setItemPrice("");
    setItemCost("");
    setSelectedEmoji(emojiConfig.defaultEmoji);
    setFormError(null);
  };

  const handleStartEdit = (item: MenuItemRecord) => {
    setEditingItemId(item.id);
    setItemName(item.name);
    setItemCategory(item.category || "General");
    setItemPrice(String(item.price || ""));
    setItemCost(String(item.cost || ""));
    setSelectedEmoji(item.emoji || emojiConfig.categoryDefaults[item.category] || emojiConfig.defaultEmoji);
    setFormError(null);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const priceNum = parseFloat(itemPrice);
    const costNum = parseFloat(itemCost) || 0;

    if (!itemName.trim() || isNaN(priceNum) || priceNum < 0) {
      setFormError("Valid product name and selling price are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const operation = editingItemId ? "update" : "create";

      const res = await manageDrink(
        account.id,
        store.id,
        operation,
        editingItemId || undefined,
        {
          name: itemName.trim(),
          category: itemCategory.trim() || "General",
          price: priceNum,
          cost: costNum,
          emoji: selectedEmoji || emojiConfig.defaultEmoji,
          recipe: [], // Direct catalog products have an empty recipe
          isActive: true,
        }
      );

      if (operation === "create") {
        setItems((prev) => [res, ...prev]);
      } else {
        setItems((prev) =>
          prev.map((i) =>
            i.id === editingItemId
              ? {
                  ...i,
                  name: itemName.trim(),
                  category: itemCategory.trim() || "General",
                  price: priceNum,
                  cost: costNum,
                  emoji: selectedEmoji,
                }
              : i
          )
        );
      }

      handleResetForm();
    } catch (err: any) {
      setFormError(err.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this item from your catalog?")) return;

    setDeletingId(id);
    try {
      await manageDrink(account.id, store.id, "delete", id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (editingItemId === id) handleResetForm();
    } catch (err: any) {
      alert(err.message || "Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  };

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))];

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col select-none">
      {/* Header */}
      <header className="h-14 border-b border-neutral-800 px-6 flex items-center justify-between bg-neutral-900 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg text-emerald-400">VistoOps</span>
          <span className="text-neutral-600">/</span>
          <span className="text-sm font-medium text-neutral-400">{store.name || store.id}</span>
          <span className="text-neutral-600">/</span>
          <span className="text-sm font-semibold text-neutral-100">
            {businessType === "service" ? "Services & Rates" : "Product Catalog"}
          </span>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium rounded text-neutral-200 transition"
        >
          &larr; Back to Dashboard
        </button>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sticky top-20 shadow-xl space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">
                {editingItemId ? "Edit Item" : "Add Product / Service"}
              </h2>
              <p className="text-xs text-neutral-400">
                {businessType === "service"
                  ? "Configure service tiers, machine rates, or billable fees."
                  : "Manage retail inventory, pricing, and gross margins."}
              </p>
            </div>

            {formError && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-400">
                {formError}
              </div>
            )}

            {/* Product Emoji Selector */}
            <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl border border-neutral-800 bg-neutral-900 flex items-center justify-center text-3xl shadow">
                {selectedEmoji}
              </div>

              <div className="flex-1">
                <span className="text-xs font-semibold text-neutral-200 block mb-1">
                  POS Item Icon
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {emojiConfig.palette.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-7 h-7 rounded-lg text-base flex items-center justify-center transition ${
                        selectedEmoji === emoji
                          ? "bg-emerald-500/20 border border-emerald-500 text-white scale-110"
                          : "bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedEmoji(emojiConfig.categoryDefaults[itemCategory] || emojiConfig.defaultEmoji)}
                    className="px-2 h-7 rounded-lg text-[10px] text-neutral-400 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Item / Service Name
                </label>
                <input
                  type="text"
                  required
                  placeholder={businessType === "service" ? "e.g. Wash & Fold (8kg)" : "e.g. Relx Pod, Cotton T-Shirt"}
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vapes, Apparel, Services"
                  value={itemCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Selling Price (₱)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Cost Price (₱)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Optional"
                    value={itemCost}
                    onChange={(e) => setItemCost(e.target.value)}
                    className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Profit Preview */}
              {parseFloat(itemPrice) > 0 && (
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 text-xs flex justify-between items-center">
                  <span className="text-neutral-400">Estimated Margin:</span>
                  <span className="font-semibold text-emerald-400">
                    ₱{(parseFloat(itemPrice) - (parseFloat(itemCost) || 0)).toFixed(2)} (
                    {(
                      ((parseFloat(itemPrice) - (parseFloat(itemCost) || 0)) / parseFloat(itemPrice)) *
                      100
                    ).toFixed(1)}
                    %)
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {editingItemId && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="w-1/3 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium rounded-lg text-neutral-300 transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${
                    editingItemId ? "w-2/3" : "w-full"
                  } rounded-lg bg-emerald-500 hover:bg-emerald-400 py-2.5 px-4 text-xs font-bold text-black uppercase tracking-wider transition disabled:opacity-50`}
                >
                  {isSubmitting ? "Saving..." : editingItemId ? "Update Item" : "+ Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Catalog List Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 rounded-lg bg-neutral-900 border border-neutral-800 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    selectedCategory === cat
                      ? "bg-emerald-500 text-black font-semibold"
                      : "bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border border-neutral-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            {isLoading ? (
              <div className="p-12 text-center text-xs text-neutral-400">Loading catalog...</div>
            ) : fetchError ? (
              <div className="p-8 text-center text-xs text-rose-400">
                {fetchError}
                <button onClick={loadData} className="block mx-auto mt-2 text-emerald-400 hover:underline">
                  Try Again
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Product / Item</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Selling Price</th>
                    <th className="px-4 py-3.5">Cost</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {filteredItems.map((item) => {
                    const icon = item.emoji || emojiConfig.categoryDefaults[item.category] || emojiConfig.defaultEmoji;
                    return (
                      <tr key={item.id} className="hover:bg-neutral-800/40 transition">
                        <td className="px-5 py-4 font-semibold text-neutral-200 flex items-center gap-3">
                          <span className="text-2xl w-8 text-center">{icon}</span>
                          <div>{item.name}</div>
                        </td>
                        <td className="px-4 py-4 text-neutral-400">{item.category}</td>
                        <td className="px-4 py-4 text-emerald-400 font-medium">
                          ₱{Number(item.price).toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-neutral-400">
                          ₱{Number(item.cost || 0).toFixed(2)}
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-emerald-400 border border-neutral-700 rounded text-xs transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={deletingId === item.id}
                            className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-xs transition disabled:opacity-50"
                          >
                            {deletingId === item.id ? "..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {!isLoading && !fetchError && filteredItems.length === 0 && (
              <div className="p-8 text-center text-neutral-500 text-xs">
                No products found in this branch catalog.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};