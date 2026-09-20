import React, { useState, useEffect, useMemo } from 'react';
import type {
  ClientAccount,
  StoreItem,
  IngredientRecord,
  RecipeIngredient,
  MenuItemRecord,
} from '../types';
import { fetchIngredients } from '../services/ingredientApi';
import { fetchCatalog } from '../services/catalogApi';
import { manageDrink } from '../services/drinkApi';

interface RestaurantMenuManageProps {
  account: ClientAccount;
  store: StoreItem;
  onBack: () => void;
}

interface RemovedIngredientHistory {
  item: RecipeIngredient;
  index: number;
}

export const RestaurantMenuManagePage: React.FC<RestaurantMenuManageProps> = ({
  account,
  store,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'builder' | 'menu'>('builder');

  // Data
  const [availableIngredients, setAvailableIngredients] = useState<
    IngredientRecord[]
  >([]);
  const [menuItems, setMenuItems] = useState<MenuItemRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Dish Basic Details
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [dishName, setDishName] = useState('');
  const [dishCategory, setDishCategory] = useState('Mains');
  const [sellingPrice, setSellingPrice] = useState('');

  // Recipe Builder State
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [ingredientAmount, setIngredientAmount] = useState('');
  const [recipe, setRecipe] = useState<RecipeIngredient[]>([]);

  // Baseline state for change detection
  const [initialDishState, setInitialDishState] = useState<{
    name: string;
    category: string;
    price: string;
    recipe: RecipeIngredient[];
  } | null>(null);

  // Undo history stack
  const [removedHistory, setRemovedHistory] = useState<
    RemovedIngredientHistory[]
  >([]);

  // Action status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [ingredients, catalog] = await Promise.all([
        fetchIngredients(account.id, store.id),
        fetchCatalog(account.id, store.id),
      ]);

      const activeIngredients = ingredients.filter((i) => i.isActive !== false);
      setAvailableIngredients(activeIngredients);
      setMenuItems(catalog);

      if (activeIngredients.length > 0 && !selectedIngredientId) {
        setSelectedIngredientId(activeIngredients[0].id);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load kitchen inventory and menu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [account.id, store.id]);

  const activeSelected = availableIngredients.find(
    (i) => i.id === selectedIngredientId,
  );

  const handleAddIngredient = () => {
    const amountNum = parseFloat(ingredientAmount);
    if (!activeSelected || isNaN(amountNum) || amountNum <= 0) return;

    const unitCost = Number(activeSelected.costPerUnit) || 0;
    const computedTotal = amountNum * unitCost;

    const existingIndex = recipe.findIndex(
      (r) => r.ingredientId === activeSelected.id,
    );

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

    setIngredientAmount('');
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    const itemIndex = recipe.findIndex(
      (item) => item.ingredientId === ingredientId,
    );
    if (itemIndex === -1) return;

    const targetItem = recipe[itemIndex];
    setRemovedHistory((prev) => [
      ...prev,
      { item: targetItem, index: itemIndex },
    ]);
    setRecipe(recipe.filter((item) => item.ingredientId !== ingredientId));
  };

  const handleUndoLast = () => {
    if (removedHistory.length === 0) return;

    const lastEntry = removedHistory[removedHistory.length - 1];
    setRecipe((prev) => {
      const updated = [...prev];
      if (lastEntry.index <= updated.length) {
        updated.splice(lastEntry.index, 0, lastEntry.item);
      } else {
        updated.push(lastEntry.item);
      }
      return updated;
    });

    setRemovedHistory((prev) => prev.slice(0, -1));
  };

  const handleUndoAll = () => {
    if (removedHistory.length === 0) return;

    let updated = [...recipe];
    for (let i = removedHistory.length - 1; i >= 0; i--) {
      const entry = removedHistory[i];
      if (entry.index <= updated.length) {
        updated.splice(entry.index, 0, entry.item);
      } else {
        updated.push(entry.item);
      }
    }

    setRecipe(updated);
    setRemovedHistory([]);
  };

  const handleEditClick = (item: MenuItemRecord) => {
    setEditingDishId(item.id);
    setDishName(item.name);
    setDishCategory(item.category);
    setSellingPrice(String(item.price));
    setRecipe(item.recipe || []);
    setRemovedHistory([]);

    setInitialDishState({
      name: item.name,
      category: item.category,
      price: String(item.price),
      recipe: item.recipe ? JSON.parse(JSON.stringify(item.recipe)) : [],
    });

    setActiveTab('builder');
  };

  const handleCancelEdit = () => {
    setEditingDishId(null);
    setDishName('');
    setDishCategory('Mains');
    setSellingPrice('');
    setRecipe([]);
    setInitialDishState(null);
    setRemovedHistory([]);
  };

  const handleDeleteDish = async (dishId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to remove this dish from the menu?',
      )
    )
      return;

    setDeletingId(dishId);
    try {
      await manageDrink(account.id, store.id, 'delete', dishId);
      setMenuItems((prev) => prev.filter((d) => d.id !== dishId));
      if (editingDishId === dishId) {
        handleCancelEdit();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete dish');
    } finally {
      setDeletingId(null);
    }
  };

  // Calculations
  const totalRecipeCost = recipe.reduce((acc, curr) => acc + curr.totalCost, 0);
  const retailPriceNum = parseFloat(sellingPrice) || 0;
  const grossProfit = retailPriceNum - totalRecipeCost;
  const profitMargin =
    retailPriceNum > 0 ? (grossProfit / retailPriceNum) * 100 : 0;

  // Change Detection Logic
  const hasFormChanged = useMemo(() => {
    if (!editingDishId || !initialDishState) return true;

    if (dishName.trim() !== initialDishState.name.trim()) return true;
    if (dishCategory !== initialDishState.category) return true;
    if (sellingPrice !== initialDishState.price) return true;
    if (recipe.length !== initialDishState.recipe.length) return true;

    const sortedCurrent = [...recipe].sort((a, b) =>
      a.ingredientId.localeCompare(b.ingredientId),
    );
    const sortedInitial = [...initialDishState.recipe].sort((a, b) =>
      a.ingredientId.localeCompare(b.ingredientId),
    );

    for (let i = 0; i < sortedCurrent.length; i++) {
      if (sortedCurrent[i].ingredientId !== sortedInitial[i].ingredientId)
        return true;
      if (Number(sortedCurrent[i].amount) !== Number(sortedInitial[i].amount))
        return true;
    }

    return false;
  }, [
    editingDishId,
    initialDishState,
    dishName,
    dishCategory,
    sellingPrice,
    recipe,
  ]);

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!dishName.trim() || retailPriceNum <= 0 || recipe.length === 0) {
      setSubmitError(
        'Please provide a dish name, target price, and at least one ingredient.',
      );
      return;
    }

    if (editingDishId && !hasFormChanged) return;

    setIsSubmitting(true);
    try {
      const operation = editingDishId ? 'update' : 'create';

      const res = await manageDrink(
        account.id,
        store.id,
        operation,
        editingDishId || undefined,
        {
          name: dishName.trim(),
          category: dishCategory,
          price: retailPriceNum,
          cost: totalRecipeCost,
          recipe,
          isActive: true,
        },
      );

      if (operation === 'create') {
        setMenuItems((prev) => [res, ...prev]);
      } else {
        setMenuItems((prev) =>
          prev.map((d) =>
            d.id === editingDishId
              ? {
                  ...d,
                  name: dishName.trim(),
                  category: dishCategory,
                  price: retailPriceNum,
                  cost: totalRecipeCost,
                  recipe,
                }
              : d,
          ),
        );
      }

      handleCancelEdit();
      setActiveTab('menu');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to save menu dish');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled =
    isSubmitting ||
    !dishName.trim() ||
    retailPriceNum <= 0 ||
    recipe.length === 0 ||
    (Boolean(editingDishId) && !hasFormChanged);

  return (
    <div className='min-h-screen bg-neutral-950 text-white flex flex-col select-none'>
      {/* Header */}
      <header className='h-14 border-b border-neutral-800 px-6 flex items-center justify-between bg-neutral-900 sticky top-0 z-20'>
        <div className='flex items-center gap-3'>
          <span className='font-bold text-lg text-emerald-400'>VistoOps</span>
          <span className='text-neutral-600'>/</span>
          <span className='text-sm font-medium text-neutral-400'>
            {store.name || store.id}
          </span>
          <span className='text-neutral-600'>/</span>
          <span className='text-sm font-semibold text-neutral-100'>
            Kitchen & Menu Recipes
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'builder'
                ? 'bg-emerald-500 text-black font-semibold'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            {editingDishId ? 'Edit Dish' : 'Recipe Kitchen'}
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'menu'
                ? 'bg-emerald-500 text-black font-semibold'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Menu Catalog ({menuItems.length})
          </button>

          <span className='text-neutral-700'>|</span>

          <button
            onClick={onBack}
            className='px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium rounded text-neutral-200 transition'
          >
            &larr; Dashboard
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className='flex-1 p-8 max-w-7xl mx-auto w-full'>
        {fetchError && (
          <div className='mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs'>
            {fetchError}
          </div>
        )}

        {/* 1. Menu List View */}
        {activeTab === 'menu' && (
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <div>
                <h2 className='text-lg font-bold text-white'>
                  Restaurant Menu Catalog
                </h2>
                <p className='text-xs text-neutral-400'>
                  Manage active dishes, portion costs (COGS), and POS terminal
                  menu pricing.
                </p>
              </div>
              <button
                onClick={() => {
                  handleCancelEdit();
                  setActiveTab('builder');
                }}
                className='px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition'
              >
                + Create New Dish
              </button>
            </div>

            <div className='bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl'>
              <table className='w-full text-left text-xs'>
                <thead className='bg-neutral-950 text-neutral-400 uppercase font-semibold'>
                  <tr>
                    <th className='px-5 py-3.5'>Dish</th>
                    <th className='px-4 py-3.5'>Category</th>
                    <th className='px-4 py-3.5'>Menu Price</th>
                    <th className='px-4 py-3.5'>Plate Cost (COGS)</th>
                    <th className='px-4 py-3.5'>Gross Margin</th>
                    <th className='px-5 py-3.5 text-right'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-neutral-800/60'>
                  {menuItems.map((item) => {
                    const cost = Number(item.cost) || 0;
                    const price = Number(item.price) || 0;
                    const profit = price - cost;
                    const margin = price > 0 ? (profit / price) * 100 : 0;

                    return (
                      <tr
                        key={item.id}
                        className='hover:bg-neutral-800/40 transition'
                      >
                        <td className='px-5 py-4 font-semibold text-neutral-200'>
                          <div>{item.name}</div>
                          <span className='text-[10px] text-neutral-500'>
                            {item.recipe?.length || 0} kitchen ingredients
                          </span>
                        </td>
                        <td className='px-4 py-4 text-neutral-400'>
                          {item.category}
                        </td>
                        <td className='px-4 py-4 text-white font-medium'>
                          ₱{price.toFixed(2)}
                        </td>
                        <td className='px-4 py-4 text-rose-400'>
                          ₱{cost.toFixed(2)}
                        </td>
                        <td className='px-4 py-4'>
                          <span
                            className={`font-semibold ${
                              margin >= 65
                                ? 'text-emerald-400'
                                : margin >= 50
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                            }`}
                          >
                            {margin.toFixed(1)}%
                          </span>
                        </td>
                        <td className='px-5 py-4 text-right space-x-2'>
                          <button
                            onClick={() => handleEditClick(item)}
                            className='px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-emerald-400 border border-neutral-700 rounded text-xs transition'
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDish(item.id)}
                            disabled={deletingId === item.id}
                            className='px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-xs transition disabled:opacity-50'
                          >
                            {deletingId === item.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {!isLoading && menuItems.length === 0 && (
                <div className='p-12 text-center text-neutral-500 text-xs'>
                  No dishes registered in this restaurant branch yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. Builder / Kitchen Recipe Mode View */}
        {activeTab === 'builder' && (
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
            <div className='lg:col-span-7 space-y-6'>
              {editingDishId && (
                <div className='p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex justify-between items-center'>
                  <span>
                    Editing Dish: <strong>{dishName}</strong>
                  </span>
                  <button
                    onClick={handleCancelEdit}
                    className='underline text-neutral-300 hover:text-white'
                  >
                    Cancel Editing
                  </button>
                </div>
              )}

              {/* Dish Info */}
              <div className='bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4'>
                <h2 className='text-base font-bold text-white tracking-wide'>
                  Dish Overview
                </h2>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                  <div className='sm:col-span-2'>
                    <label className='block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5'>
                      Dish Name
                    </label>
                    <input
                      type='text'
                      placeholder='e.g. USDA Ribeye Steak 250g, Carbonara'
                      value={dishName}
                      onChange={(e) => setDishName(e.target.value)}
                      className='w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500'
                    />
                  </div>

                  <div>
                    <label className='block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5'>
                      Course Category
                    </label>
                    <select
                      value={dishCategory}
                      onChange={(e) => setDishCategory(e.target.value)}
                      className='w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500'
                    >
                      <option value='Appetizers'>Appetizers</option>
                      <option value='Mains'>Mains</option>
                      <option value='Pasta'>Pasta</option>
                      <option value='Sides'>Sides</option>
                      <option value='Desserts'>Desserts</option>
                      <option value='Beverages'>Beverages</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className='block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5'>
                    Target Menu Price (₱)
                  </label>
                  <input
                    type='number'
                    step='1'
                    placeholder='280'
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className='w-full sm:w-1/2 rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500'
                  />
                </div>
              </div>

              {/* Kitchen Recipe Composition */}
              <div className='bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-base font-bold text-white tracking-wide'>
                    Bill of Materials / Ingredients
                  </h2>
                  <span className='text-xs text-neutral-400'>
                    {availableIngredients.length} kitchen stock items
                  </span>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-12 gap-3 items-end'>
                  <div className='sm:col-span-6'>
                    <label className='block text-xs text-neutral-400 mb-1'>
                      Select Ingredient
                    </label>
                    <select
                      value={selectedIngredientId}
                      onChange={(e) => setSelectedIngredientId(e.target.value)}
                      className='w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500'
                    >
                      {availableIngredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} (₱{Number(ing.costPerUnit || 0).toFixed(3)}
                          /{ing.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='sm:col-span-3'>
                    <label className='block text-xs text-neutral-400 mb-1'>
                      Portion ({activeSelected?.unit || 'unit'})
                    </label>
                    <input
                      type='number'
                      step='any'
                      placeholder={
                        activeSelected?.unit === 'cups'
                          ? 'e.g. 1'
                          : activeSelected?.unit === 'g'
                            ? 'e.g. 150'
                            : 'e.g. 1'
                      }
                      value={ingredientAmount}
                      onChange={(e) => setIngredientAmount(e.target.value)}
                      className='w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500'
                    />
                  </div>

                  <div className='sm:col-span-3'>
                    <button
                      type='button'
                      onClick={handleAddIngredient}
                      className='w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition'
                    >
                      + Add Ingredient
                    </button>
                  </div>
                </div>

                {/* Undo Stack Notification Banner */}
                {removedHistory.length > 0 && (
                  <div className='p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs flex items-center justify-between text-amber-400'>
                    <span>
                      {removedHistory.length === 1 ? (
                        <>
                          Removed <strong>{removedHistory[0].item.name}</strong>{' '}
                          from recipe.
                        </>
                      ) : (
                        <>
                          Removed{' '}
                          <strong>{removedHistory.length} ingredients</strong> (
                          {removedHistory.map((h) => h.item.name).join(', ')})
                        </>
                      )}
                    </span>
                    <div className='flex items-center gap-2 flex-shrink-0 ml-3'>
                      {removedHistory.length > 1 && (
                        <button
                          type='button'
                          onClick={handleUndoLast}
                          className='underline hover:text-white transition'
                        >
                          Undo Last
                        </button>
                      )}
                      <button
                        type='button'
                        onClick={handleUndoAll}
                        className='font-bold underline hover:text-white transition'
                      >
                        {removedHistory.length > 1 ? 'Undo All' : 'Undo'}
                      </button>
                      <button
                        type='button'
                        onClick={() => setRemovedHistory([])}
                        className='text-neutral-500 hover:text-neutral-300 ml-1 text-sm leading-none'
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Recipe Table */}
                <div className='border border-neutral-800 rounded-xl overflow-hidden mt-4'>
                  <table className='w-full text-left text-xs'>
                    <thead className='bg-neutral-950 text-neutral-400 uppercase font-semibold'>
                      <tr>
                        <th className='px-4 py-3'>Kitchen Raw Material</th>
                        <th className='px-3 py-3'>Portion</th>
                        <th className='px-3 py-3'>Cost Breakdown</th>
                        <th className='px-3 py-3 text-right'>Remove</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-neutral-800'>
                      {recipe.map((item) => (
                        <tr
                          key={item.ingredientId}
                          className='hover:bg-neutral-800/40'
                        >
                          <td className='px-4 py-3 font-medium text-neutral-200'>
                            {item.name}
                          </td>
                          <td className='px-3 py-3 text-neutral-300'>
                            {item.amount} {item.unit}
                          </td>
                          <td className='px-3 py-3 text-emerald-400 font-medium'>
                            ₱{item.totalCost.toFixed(2)}
                          </td>
                          <td className='px-3 py-3 text-right'>
                            <button
                              onClick={() =>
                                handleRemoveIngredient(item.ingredientId)
                              }
                              className='text-neutral-500 hover:text-rose-400 transition'
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {recipe.length === 0 && (
                    <div className='p-6 text-center text-xs text-neutral-500'>
                      No raw ingredients assigned to this dish recipe yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Live Margins & Submission */}
            <div className='lg:col-span-5 space-y-6'>
              <div className='bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4'>
                <h2 className='text-base font-bold text-white tracking-wide'>
                  Costing & Margins
                </h2>

                <div className='space-y-3 border-b border-neutral-800 pb-4 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-neutral-400'>
                      Total Plate Cost (COGS)
                    </span>
                    <span className='font-semibold text-rose-400'>
                      ₱{totalRecipeCost.toFixed(2)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-neutral-400'>Menu Selling Price</span>
                    <span className='font-semibold text-neutral-200'>
                      ₱{retailPriceNum.toFixed(2)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-neutral-400'>
                      Gross Margin per Plate
                    </span>
                    <span
                      className={`font-semibold ${
                        grossProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      ₱{grossProfit.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className='flex items-center justify-between pt-1'>
                  <div>
                    <p className='text-xs text-neutral-400 uppercase font-semibold'>
                      Profit Margin
                    </p>
                    <p
                      className={`text-2xl font-bold mt-0.5 ${
                        profitMargin >= 65
                          ? 'text-emerald-400'
                          : profitMargin >= 50
                            ? 'text-amber-400'
                            : 'text-rose-400'
                      }`}
                    >
                      {profitMargin.toFixed(1)}%
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${
                      profitMargin >= 65
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : profitMargin >= 50
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {profitMargin >= 65
                      ? 'Target Margin'
                      : profitMargin >= 50
                        ? 'Acceptable'
                        : 'High Food Cost'}
                  </span>
                </div>
              </div>

              {submitError && (
                <div className='p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400'>
                  {submitError}
                </div>
              )}

              <button
                type='button'
                onClick={handleSaveDish}
                disabled={isButtonDisabled}
                className='w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.99]'
              >
                {isSubmitting
                  ? 'Saving Dish...'
                  : editingDishId
                    ? hasFormChanged
                      ? 'Update Menu Dish \u2192'
                      : 'No Changes Detected'
                    : 'Publish to Restaurant Menu \u2192'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
