import React, { useState, useEffect } from "react";
import type { ClientAccount, StoreItem, IngredientRecord } from "../types";
import { fetchIngredients } from "../services/ingredientApi";

interface ManageIngredientsProps {
  account: ClientAccount;
  store: StoreItem;
  onBack: () => void;
}

export const ManageIngredientsPage: React.FC<ManageIngredientsProps> = ({
  account,
  store,
  onBack,
}) => {
  const [ingredients, setIngredients] = useState<IngredientRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Registration Form State
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<string>("Dairy");
  const [newUnit, setNewUnit] = useState<string>("ml");
  const [newPackagePrice, setNewPackagePrice] = useState("");
  const [newPackageSize, setNewPackageSize] = useState("");
  const [newInitialPacks, setNewInitialPacks] = useState("1");
  const [newReorder, setNewReorder] = useState("");

  // Edit / Price Adjustment Modal State
  const [editingItem, setEditingItem] = useState<IngredientRecord | null>(null);
  const [editPackagePrice, setEditPackagePrice] = useState("");
  const [editPackageSize, setEditPackageSize] = useState("");

  // Fetch real data on mount or when store changes
  const loadData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await fetchIngredients(account.id, store.id);
      setIngredients(data);
    } catch (err: any) {
      setFetchError(err.message || "Failed to load ingredients");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [account.id, store.id]);

  // Live calculation preview in registration form
  const parsedPrice = parseFloat(newPackagePrice) || 0;
  const parsedSize = parseFloat(newPackageSize) || 0;
  const previewCostPerUnit = parsedSize > 0 ? parsedPrice / parsedSize : 0;

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || parsedSize <= 0) return;

    const initialPacks = parseFloat(newInitialPacks) || 0;
    const computedCostPerUnit = parsedPrice / parsedSize;

    const newItem: IngredientRecord = {
      id: `ing_${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      unit: newUnit,
      costPerUnit: computedCostPerUnit,
      currentStock: initialPacks * parsedSize,
      reorderLevel: parseFloat(newReorder) || 0,
      packageSpecs: {
        packagePrice: parsedPrice,
        packageSize: parsedSize,
      },
      isActive: true,
    };

    setIngredients((prev) => [newItem, ...prev]);
    setNewName("");
    setNewPackagePrice("");
    setNewPackageSize("");
    setNewInitialPacks("1");
    setNewReorder("");
  };

  const openPriceEditModal = (item: IngredientRecord) => {
    setEditingItem(item);
    setEditPackagePrice(String(item.packageSpecs.packagePrice));
    setEditPackageSize(String(item.packageSpecs.packageSize));
  };

  const handleSavePriceChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const price = parseFloat(editPackagePrice) || 0;
    const size = parseFloat(editPackageSize) || 0;
    if (size <= 0) return;

    const updatedCostPerUnit = price / size;

    setIngredients((prev) =>
      prev.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              packageSpecs: {
                packagePrice: price,
                packageSize: size,
              },
              costPerUnit: updatedCostPerUnit,
            }
          : item
      )
    );

    setEditingItem(null);
  };

  // Derive categories dynamically from retrieved database items
  const uniqueCategories = Array.from(
    new Set(ingredients.map((item) => item.category).filter(Boolean))
  );
  const categories = ["All", ...uniqueCategories];

  const filtered = ingredients.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
          <span className="text-sm font-semibold text-neutral-100">Inventory & Pricing</span>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium rounded text-neutral-200 transition"
        >
          &larr; Back to Dashboard
        </button>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Intake Registration Form */}
        <div className="lg:col-span-1">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sticky top-20 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-1">Add Bulk Ingredient</h2>
            <p className="text-xs text-neutral-400 mb-5">
              Enter package purchasing details. The unit cost is computed automatically.
            </p>

            <form onSubmit={handleAddIngredient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Ingredient Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arla Full Cream Milk"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Dairy">Dairy</option>
                    <option value="Beans">Beans</option>
                    <option value="Syrups">Syrups</option>
                    <option value="Powders">Powders</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Measurement Unit
                  </label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ml">Milliliters (ml)</option>
                    <option value="g">Grams (g)</option>
                    <option value="pcs">Pieces (pcs)</option>
                  </select>
                </div>
              </div>

              {/* Bulk Purchasing Specs */}
              <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800/80 space-y-3">
                <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Bulk Package Specs
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Package Price</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="₱120.00"
                      value={newPackagePrice}
                      onChange={(e) => setNewPackagePrice(e.target.value)}
                      className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Net Size ({newUnit})</label>
                    <input
                      type="number"
                      required
                      placeholder="1000"
                      value={newPackageSize}
                      onChange={(e) => setNewPackageSize(e.target.value)}
                      className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Auto Calculated Unit Price Badge */}
                <div className="flex justify-between items-center pt-2 border-t border-neutral-800 text-xs">
                  <span className="text-neutral-400">Calculated Cost:</span>
                  <span className="font-semibold text-emerald-400">
                    ₱{previewCostPerUnit.toFixed(4)} / {newUnit}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Initial Stock (Packs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newInitialPacks}
                    onChange={(e) => setNewInitialPacks(e.target.value)}
                    className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Alert Level ({newUnit})
                  </label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={newReorder}
                    onChange={(e) => setNewReorder(e.target.value)}
                    className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 py-2.5 px-4 text-xs font-bold text-black uppercase tracking-wider transition"
              >
                + Register Ingredient
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Inventory Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <input
              type="text"
              placeholder="Search ingredients..."
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
              <div className="p-12 text-center text-xs text-neutral-400">
                Loading store ingredients...
              </div>
            ) : fetchError ? (
              <div className="p-8 text-center text-xs text-rose-400">
                {fetchError}
                <button
                  onClick={loadData}
                  className="block mx-auto mt-2 text-emerald-400 hover:underline"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Ingredient</th>
                    <th className="px-4 py-3.5">Package Specs</th>
                    <th className="px-4 py-3.5">Calculated Unit Cost</th>
                    <th className="px-4 py-3.5">Current Stock</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-800/40 transition">
                      <td className="px-5 py-4 font-semibold text-neutral-200">
                        <div>{item.name}</div>
                        <span className="text-[10px] text-neutral-500">{item.category}</span>
                      </td>
                      <td className="px-4 py-4 text-neutral-300">
                        ₱{item.packageSpecs.packagePrice.toFixed(2)} / {item.packageSpecs.packageSize} {item.unit}
                      </td>
                      <td className="px-4 py-4 font-medium text-emerald-400">
                        ₱{item.costPerUnit.toFixed(4)} / {item.unit}
                      </td>
                      <td className="px-4 py-4 text-white">
                        {item.currentStock.toLocaleString()} {item.unit}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => openPriceEditModal(item)}
                          className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-emerald-400 border border-neutral-700 rounded text-xs transition"
                        >
                          Adjust Price
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!isLoading && !fetchError && filtered.length === 0 && (
              <div className="p-8 text-center text-neutral-500 text-xs">
                No ingredients found in this branch.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Price / Supplier Change Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Adjust Purchase Price</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Update {editingItem.name} supplier pricing.
            </p>

            <form onSubmit={handleSavePriceChange} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Package Price (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editPackagePrice}
                  onChange={(e) => setEditPackagePrice(e.target.value)}
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Package Net Size ({editingItem.unit})
                </label>
                <input
                  type="number"
                  required
                  value={editPackageSize}
                  onChange={(e) => setEditPackageSize(e.target.value)}
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-neutral-950 rounded-lg text-xs flex justify-between">
                <span className="text-neutral-400">New Unit Cost:</span>
                <span className="text-emerald-400 font-semibold">
                  ₱
                  {(
                    (parseFloat(editPackagePrice) || 0) /
                    (parseFloat(editPackageSize) || 1)
                  ).toFixed(4)}{" "}
                  / {editingItem.unit}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="w-1/2 py-2 text-xs bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 text-xs bg-emerald-500 hover:bg-emerald-400 rounded-lg text-black font-semibold transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};