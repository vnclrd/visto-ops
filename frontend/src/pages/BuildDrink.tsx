import React, { useState, useEffect } from "react";
import type { ClientAccount, StoreItem, IngredientRecord, RecipeIngredient } from "../types";
import { fetchIngredients } from "../services/ingredientApi";
import { manageDrink } from "../services/drinkApi";

interface BuildDrinkProps {
  account: ClientAccount;
  store: StoreItem;
  onBack: () => void;
}

export const BuildDrinkPage: React.FC<BuildDrinkProps> = ({
  account,
  store,
  onBack,
}) => {
  const [availableIngredients, setAvailableIngredients] = useState<IngredientRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Drink Basic Details
  const [drinkName, setDrinkName] = useState("");
  const [drinkCategory, setDrinkCategory] = useState("Espresso");
  const [sellingPrice, setSellingPrice] = useState("");

  // Recipe Builder State
  const [selectedIngredientId, setSelectedIngredientId] = useState("");
  const [ingredientAmount, setIngredientAmount] = useState("");
  const [recipe, setRecipe] = useState<RecipeIngredient[]>([]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const loadIngredients = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const data = await fetchIngredients(account.id, store.id);
        const activeItems = data.filter((item) => item.isActive !== false);
        setAvailableIngredients(activeItems);
        if (activeItems.length > 0) {
          setSelectedIngredientId(activeItems[0].id);
        }
      } catch (err: any) {
        setFetchError(err.message || "Failed to load ingredients");
      } finally {
        setIsLoading(false);
      }
    };

    loadIngredients();
  }, [account.id, store.id]);

  const activeSelected = availableIngredients.find((i) => i.id === selectedIngredientId);

  const handleAddIngredientToRecipe = () => {
    const amountNum = parseFloat(ingredientAmount);
    if (!activeSelected || isNaN(amountNum) || amountNum <= 0) return;

    const unitCost = Number(activeSelected.costPerUnit) || 0;
    const computedTotal = amountNum * unitCost;

    const existingIndex = recipe.findIndex((r) => r.ingredientId === activeSelected.id);

    if (existingIndex > -1) {
      const updated = [...recipe];
      const newAmount = updated[existingIndex].amount + amountNum;
      updated[existingIndex] = {
        ...updated[existingIndex],
        amount: newAmount,
        totalCost: newAmount * unitCost,
      };
      setRecipe(updated);
    } else {
      const newEntry: RecipeIngredient = {
        ingredientId: activeSelected.id,
        name: activeSelected.name,
        unit: activeSelected.unit,
        amount: amountNum,
        costPerUnit: unitCost,
        totalCost: computedTotal,
      };
      setRecipe([...recipe, newEntry]);
    }

    setIngredientAmount("");
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setRecipe(recipe.filter((item) => item.ingredientId !== ingredientId));
  };

  // Financial Calculations
  const totalRecipeCost = recipe.reduce((acc, curr) => acc + curr.totalCost, 0);
  const retailPriceNum = parseFloat(sellingPrice) || 0;
  const grossProfit = retailPriceNum - totalRecipeCost;
  const profitMargin = retailPriceNum > 0 ? (grossProfit / retailPriceNum) * 100 : 0;

  const handleSaveDrink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!drinkName.trim() || retailPriceNum <= 0 || recipe.length === 0) {
      setSubmitError("Please provide a name, a valid price, and at least one ingredient.");
      return;
    }

    setIsSubmitting(true);

    try {
      await manageDrink(account.id, store.id, "create", undefined, {
        name: drinkName.trim(),
        category: drinkCategory,
        price: retailPriceNum,
        cost: totalRecipeCost,
        recipe,
        isActive: true,
      });

      // Navigate back to overview upon successful creation
      onBack();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to publish drink to catalog");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col select-none">
      {/* Top Header */}
      <header className="h-14 border-b border-neutral-800 px-6 flex items-center justify-between bg-neutral-900 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg text-emerald-400">VistoOps</span>
          <span className="text-neutral-600">/</span>
          <span className="text-sm font-medium text-neutral-400">{store.name || store.id}</span>
          <span className="text-neutral-600">/</span>
          <span className="text-sm font-semibold text-neutral-100">Recipe & Drink Builder</span>
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
        {/* Left 7 Columns: Recipe Composition Studio */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Basic Drink Identity */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white tracking-wide">Drink Essentials</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Drink Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Iced Vanilla Oat Latte"
                  value={drinkName}
                  onChange={(e) => setDrinkName(e.target.value)}
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Category
                </label>
                <select
                  value={drinkCategory}
                  onChange={(e) => setDrinkCategory(e.target.value)}
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Espresso">Espresso</option>
                  <option value="Milk Tea">Milk Tea</option>
                  <option value="Matcha">Matcha</option>
                  <option value="Non-Coffee">Non-Coffee</option>
                  <option value="Frappe">Frappe</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Target Selling Price (₱)
              </label>
              <input
                type="number"
                step="1"
                placeholder="160"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full sm:w-1/2 rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* 2. Add Ingredient to Recipe */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white tracking-wide">Recipe Ingredients</h2>
              <span className="text-xs text-neutral-400">
                {availableIngredients.length} supplies available
              </span>
            </div>

            {isLoading ? (
              <p className="text-xs text-neutral-500">Loading ingredient database...</p>
            ) : fetchError ? (
              <p className="text-xs text-rose-400">{fetchError}</p>
            ) : availableIngredients.length === 0 ? (
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-400 text-center">
                No raw ingredients found. Add ingredients in the inventory section first.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-6">
                    <label className="block text-xs text-neutral-400 mb-1">Select Ingredient</label>
                    <select
                      value={selectedIngredientId}
                      onChange={(e) => setSelectedIngredientId(e.target.value)}
                      className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {availableIngredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} (₱{Number(ing.costPerUnit || 0).toFixed(3)}/{ing.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs text-neutral-400 mb-1">
                      Amount ({activeSelected?.unit || "unit"})
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 150"
                      value={ingredientAmount}
                      onChange={(e) => setIngredientAmount(e.target.value)}
                      className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <button
                      type="button"
                      onClick={handleAddIngredientToRecipe}
                      className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Ingredients Breakdown Table */}
                <div className="border border-neutral-800 rounded-xl overflow-hidden mt-4">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-950 text-neutral-400 uppercase font-semibold">
                      <tr>
                        <th className="px-4 py-3">Ingredient</th>
                        <th className="px-3 py-3">Dose</th>
                        <th className="px-3 py-3">Cost Breakdown</th>
                        <th className="px-3 py-3 text-right">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {recipe.map((item) => (
                        <tr key={item.ingredientId} className="hover:bg-neutral-800/40">
                          <td className="px-4 py-3 font-medium text-neutral-200">{item.name}</td>
                          <td className="px-3 py-3 text-neutral-300">
                            {item.amount} {item.unit}
                          </td>
                          <td className="px-3 py-3 text-emerald-400 font-medium">
                            ₱{item.totalCost.toFixed(2)}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <button
                              onClick={() => handleRemoveIngredient(item.ingredientId)}
                              className="text-neutral-500 hover:text-rose-400 transition"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {recipe.length === 0 && (
                    <div className="p-6 text-center text-xs text-neutral-500">
                      No ingredients added to this recipe yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Columns: Live Profitability & POS Card Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* Financial Breakdown Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white tracking-wide">Profitability & Costing</h2>

            <div className="space-y-3 border-b border-neutral-800 pb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Total Recipe Cost (COGS)</span>
                <span className="font-semibold text-rose-400">₱{totalRecipeCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Target Menu Price</span>
                <span className="font-semibold text-neutral-200">₱{retailPriceNum.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Gross Margin per Cup</span>
                <span
                  className={`font-semibold ${
                    grossProfit >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  ₱{grossProfit.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs text-neutral-400 uppercase font-semibold">Profit Margin</p>
                <p
                  className={`text-2xl font-bold mt-0.5 ${
                    profitMargin >= 65
                      ? "text-emerald-400"
                      : profitMargin >= 40
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                >
                  {profitMargin.toFixed(1)}%
                </p>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${
                  profitMargin >= 65
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : profitMargin >= 40
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}
              >
                {profitMargin >= 65 ? "Optimal" : profitMargin >= 40 ? "Moderate" : "Low Margin"}
              </span>
            </div>
          </div>

          {/* POS Terminal Tile Preview */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Terminal Button Preview
            </h2>
            <div className="p-4 rounded-xl border border-neutral-700 bg-neutral-950 flex flex-col justify-between h-28 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-white text-sm">
                  {drinkName.trim() || "Item Name"}
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                  {drinkCategory}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-emerald-400 font-bold text-base">
                  ₱{retailPriceNum.toFixed(2)}
                </span>
                <span className="text-[10px] text-neutral-500">
                  {recipe.length} ingredients
                </span>
              </div>
            </div>
          </div>

          {submitError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
              {submitError}
            </div>
          )}

          {/* Submission Action */}
          <button
            type="button"
            onClick={handleSaveDrink}
            disabled={isSubmitting || !drinkName.trim() || retailPriceNum <= 0 || recipe.length === 0}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {isSubmitting ? "Publishing Drink..." : "Publish to Store Menu \u2192"}
          </button>
        </div>
      </main>
    </div>
  );
};