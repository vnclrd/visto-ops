import React, { useState, useEffect } from 'react';
import type {
  ClientAccount,
  StoreItem,
  IngredientRecord,
  BatchRecipeIngredient,
} from '../types';
import { fetchIngredients, manageIngredient } from '../services/ingredientApi';

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

  const [activeTab, setActiveTab] = useState<'activeStock' | 'rawBasis'>(
    'activeStock',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const businessType = store.businessType || account.businessType || 'cafe';
  const isCafe = businessType === 'cafe';
  const isRestaurant = businessType === 'restaurant';

  const config = isCafe
    ? {
        headerTitle: 'Ingredients & Supplies',
        cardTitle: 'Add Bulk Ingredient',
        cardSubtitle:
          'Enter package purchasing details. The unit cost is computed automatically.',
        nameLabel: 'Ingredient Name',
        namePlaceholder: 'e.g. Arla Full Cream Milk, Vanilla Syrup',
        defaultCategory: 'Dairy',
        categories: ['Dairy', 'Beans', 'Syrups', 'Powders', 'Packaging'],
        units: [
          { value: 'ml', label: 'Milliliters (ml)' },
          { value: 'g', label: 'Grams (g)' },
          { value: 'pcs', label: 'Pieces (pcs)' },
        ],
        tableColName: 'Ingredient',
        emptyText: 'No ingredients found in this branch.',
        submitBtn: '+ Register Ingredient',
      }
    : isRestaurant
      ? {
          headerTitle: 'Kitchen Supplies & Batch Inventory',
          cardTitle: 'Register Kitchen Item',
          cardSubtitle:
            'Add raw materials (static price basis) or direct supplies (e.g. Eggs, Rice).',
          nameLabel: 'Item Name',
          namePlaceholder: 'e.g. Beef (Tapa), Hotdog, Rice, Egg',
          defaultCategory: 'Meat & Poultry',
          categories: [
            'Meat & Poultry',
            'Seafood',
            'Produce & Vegetables',
            'Dairy & Eggs',
            'Pantry & Dry Goods',
            'Condiments & Sauces',
            'Oils & Seasonings',
            'Packaging & Disposables',
          ],
          units: [
            { value: 'g', label: 'Grams (g)' },
            { value: 'ml', label: 'Milliliters (ml)' },
            { value: 'cups', label: 'Cups / Portions (cups)' },
            { value: 'pcs', label: 'Pieces (pcs)' },
          ],
          tableColName: 'Supply Item',
          emptyText: 'No items registered in this view.',
          submitBtn: '+ Register Item',
        }
      : {
          headerTitle: 'Materials & Supplies',
          cardTitle: 'Add Supply / Material',
          cardSubtitle:
            'Record bulk supply purchasing specs. The unit cost is computed automatically.',
          nameLabel: 'Item / Supply Name',
          namePlaceholder: 'e.g. Detergent Pods 50s, Packaging Bag',
          defaultCategory: 'Consumables',
          categories: [
            'Consumables',
            'Raw Materials',
            'Packaging',
            'Cleaning',
            'General',
          ],
          units: [
            { value: 'pcs', label: 'Pieces (pcs)' },
            { value: 'g', label: 'Grams (g)' },
            { value: 'ml', label: 'Milliliters (ml)' },
            { value: 'kg', label: 'Kilograms (kg)' },
            { value: 'loads', label: 'Loads' },
          ],
          tableColName: 'Supply / Material',
          emptyText: 'No supplies or materials found in this branch.',
          submitBtn: '+ Register Supply',
        };

  // Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<string>(
    config.defaultCategory,
  );
  const [newUnit, setNewUnit] = useState<string>(config.units[0].value);
  const [newPackagePrice, setNewPackagePrice] = useState('');
  const [newPackageSize, setNewPackageSize] = useState('');
  const [newInitialPacks, setNewInitialPacks] = useState('1');
  const [newReorder, setNewReorder] = useState('');
  const [trackLiveStock, setTrackLiveStock] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Restock & Price Adjustment Modal State
  const [editingItem, setEditingItem] = useState<IngredientRecord | null>(null);
  const [editPackagePrice, setEditPackagePrice] = useState('');
  const [editPackageSize, setEditPackageSize] = useState('');
  const [restockPacks, setRestockPacks] = useState('1');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Batch Prep Modal State
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);
  const [batchItemName, setBatchItemName] = useState<string>('');
  const [batchCategory] = useState<string>('Meat & Poultry');
  const [batchYieldPortions, setBatchYieldPortions] = useState<string>('125');
  const [batchRecipe, setBatchRecipe] = useState<BatchRecipeIngredient[]>([]);
  const [selectedBatchIngId, setSelectedBatchIngId] = useState<string>('');
  const [batchIngAmount, setBatchIngAmount] = useState<string>('');

  const loadData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await fetchIngredients(account.id, store.id);
      setIngredients(data);
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load ingredients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [account.id, store.id]);

  const rawIngredients = ingredients.filter((i) =>
    isRestaurant ? i.itemType === 'raw' : true,
  );

  const activeStockIngredients = ingredients.filter((i) =>
    isRestaurant ? i.itemType !== 'raw' : true,
  );

  useEffect(() => {
    if (rawIngredients.length > 0 && !selectedBatchIngId) {
      setSelectedBatchIngId(rawIngredients[0].id);
    }
  }, [ingredients, selectedBatchIngId, rawIngredients]);

  const parsedPrice = parseFloat(newPackagePrice) || 0;
  const parsedSize = parseFloat(newPackageSize) || 0;
  const previewCostPerUnit = parsedSize > 0 ? parsedPrice / parsedSize : 0;

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmed = newName.trim();
    if (!trimmed || parsedSize <= 0) {
      setFormError('Valid name and package size are required.');
      return;
    }

    const exists = ingredients.some(
      (ing) =>
        ing.isActive !== false &&
        ing.name.trim().toLowerCase() === trimmed.toLowerCase(),
    );

    if (exists) {
      setFormError(`An ingredient named "${trimmed}" already exists.`);
      return;
    }

    const initialPacks = parseFloat(newInitialPacks) || 0;
    setIsSubmitting(true);

    try {
      const itemType: 'raw' | 'direct' | undefined = isRestaurant
        ? trackLiveStock
          ? 'direct'
          : 'raw'
        : undefined;

      const currentStock =
        isRestaurant && !trackLiveStock ? 0 : initialPacks * parsedSize;

      const created = await manageIngredient(
        account.id,
        store.id,
        'create',
        undefined,
        {
          name: trimmed,
          category: newCategory,
          unit: newUnit,
          currentStock,
          reorderLevel: parseFloat(newReorder) || 0,
          packageSpecs: {
            packagePrice: parsedPrice,
            packageSize: parsedSize,
          },
          costPerUnit: previewCostPerUnit,
          itemType,
          isActive: true,
        },
      );

      setIngredients((prev) => [created, ...prev]);

      setNewName('');
      setNewPackagePrice('');
      setNewPackageSize('');
      setNewInitialPacks('1');
      setNewReorder('');

      if (isRestaurant) {
        setActiveTab(trackLiveStock ? 'activeStock' : 'rawBasis');
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to register item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIngredient = async (item: IngredientRecord) => {
    if (!item.id) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(item.id);
    try {
      await manageIngredient(account.id, store.id, 'delete', item.id);
      setIngredients((prev) => prev.filter((ing) => ing.id !== item.id));
      if (editingItem?.id === item.id) {
        setEditingItem(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete ingredient');
    } finally {
      setDeletingId(null);
    }
  };

  const openRestockModal = (item: IngredientRecord) => {
    setEditingItem(item);
    setEditError(null);
    setEditPackagePrice(String(item.packageSpecs?.packagePrice ?? 0));
    setEditPackageSize(String(item.packageSpecs?.packageSize ?? 0));
    setRestockPacks('1');
  };

  // Weighted Average Calculation for Restocking Modal
  const isRawBasisItem = editingItem?.itemType === 'raw';
  const incomingPacks = parseFloat(restockPacks) || 0;
  const incomingPkgPrice = parseFloat(editPackagePrice) || 0;
  const incomingPkgSize = parseFloat(editPackageSize) || 1;

  const currentStockUnits = editingItem?.currentStock || 0;
  const currentCost = editingItem?.costPerUnit || 0;
  const currentTotalValue = currentStockUnits * currentCost;

  const addedStockUnits = incomingPacks * incomingPkgSize;
  const addedTotalValue = incomingPacks * incomingPkgPrice;

  const projectedTotalStock = isRawBasisItem
    ? 0
    : currentStockUnits + addedStockUnits;
  const projectedBlendedCost = isRawBasisItem
    ? incomingPkgSize > 0
      ? incomingPkgPrice / incomingPkgSize
      : 0
    : projectedTotalStock > 0
      ? (currentTotalValue + addedTotalValue) / projectedTotalStock
      : incomingPkgSize > 0
        ? incomingPkgPrice / incomingPkgSize
        : 0;

  const handleSaveRestockAndPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (incomingPkgSize <= 0) {
      setEditError('Package size must be greater than 0');
      return;
    }

    setIsSavingEdit(true);
    setEditError(null);

    try {
      if (isRawBasisItem) {
        await manageIngredient(account.id, store.id, 'update', editingItem.id, {
          packageSpecs: {
            packagePrice: incomingPkgPrice,
            packageSize: incomingPkgSize,
          },
          costPerUnit: projectedBlendedCost,
        });

        setIngredients((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  packageSpecs: {
                    packagePrice: incomingPkgPrice,
                    packageSize: incomingPkgSize,
                  },
                  costPerUnit: projectedBlendedCost,
                }
              : item,
          ),
        );
      } else {
        await manageIngredient(account.id, store.id, 'update', editingItem.id, {
          currentStock: projectedTotalStock,
          packageSpecs: {
            packagePrice: incomingPkgPrice,
            packageSize: incomingPkgSize,
          },
          costPerUnit: projectedBlendedCost,
        });

        setIngredients((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  currentStock: projectedTotalStock,
                  packageSpecs: {
                    packagePrice: incomingPkgPrice,
                    packageSize: incomingPkgSize,
                  },
                  costPerUnit: projectedBlendedCost,
                }
              : item,
          ),
        );
      }

      setEditingItem(null);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update stock');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Batch Prep Handlers
  const activeBatchSelected =
    rawIngredients.find((i) => i.id === selectedBatchIngId) ||
    rawIngredients[0];

  const handleAddIngredientToBatch = () => {
    const amt = parseFloat(batchIngAmount);
    if (!activeBatchSelected || isNaN(amt) || amt <= 0) return;

    const unitCost = Number(activeBatchSelected.costPerUnit) || 0;
    const lineCost = amt * unitCost;

    const existingIndex = batchRecipe.findIndex(
      (b) => b.ingredientId === activeBatchSelected.id,
    );

    if (existingIndex > -1) {
      const updated = [...batchRecipe];
      const newAmt = updated[existingIndex].amount + amt;
      updated[existingIndex] = {
        ...updated[existingIndex],
        amount: newAmt,
        totalCost: newAmt * unitCost,
      };
      setBatchRecipe(updated);
    } else {
      setBatchRecipe((prev) => [
        ...prev,
        {
          ingredientId: activeBatchSelected.id,
          name: activeBatchSelected.name,
          unit: activeBatchSelected.unit,
          amount: amt,
          costPerUnit: unitCost,
          totalCost: lineCost,
        },
      ]);
    }
    setBatchIngAmount('');
  };

  const handleRemoveBatchIngredient = (ingId: string) => {
    setBatchRecipe((prev) => prev.filter((b) => b.ingredientId !== ingId));
  };

  const totalBatchCost = batchRecipe.reduce(
    (sum, item) => sum + item.totalCost,
    0,
  );
  const yieldCount = parseFloat(batchYieldPortions) || 1;
  const computedUnitCostPerPortion =
    yieldCount > 0 ? totalBatchCost / yieldCount : 0;

  const handleSaveBatchAsIngredient = async () => {
    if (!batchItemName.trim() || yieldCount <= 0 || batchRecipe.length === 0) {
      alert(
        'Please provide a batch item name, yield portion count, and at least one ingredient.',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await manageIngredient(
        account.id,
        store.id,
        'create',
        undefined,
        {
          name: batchItemName.trim(),
          category: batchCategory,
          unit: 'portions',
          currentStock: yieldCount,
          reorderLevel: 10,
          itemType: 'prepped',
          batchRecipe,
          packageSpecs: {
            packagePrice: totalBatchCost,
            packageSize: yieldCount,
          },
          costPerUnit: computedUnitCostPerPortion,
          isActive: true,
        },
      );

      setIngredients((prev) => [created, ...prev]);
      setShowBatchModal(false);
      setBatchItemName('');
      setBatchRecipe([]);
      setBatchYieldPortions('125');
      setActiveTab('activeStock');
    } catch (err: any) {
      alert(err.message || 'Failed to register prepped batch item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeDataset = isRestaurant
    ? activeTab === 'activeStock'
      ? activeStockIngredients
      : rawIngredients
    : ingredients;

  const uniqueStoredCategories = Array.from(
    new Set(activeDataset.map((item) => item.category).filter(Boolean)),
  );
  const filterCategories = [
    'All',
    ...Array.from(new Set([...config.categories, ...uniqueStoredCategories])),
  ];

  const filtered = activeDataset.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const shouldShowStockInputs = !isRestaurant || trackLiveStock;

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
            {config.headerTitle}
          </span>
        </div>
        <button
          onClick={onBack}
          className='px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium rounded text-neutral-200 transition'
        >
          &larr; Back to Dashboard
        </button>
      </header>

      <main className='flex-1 p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Left Column: Intake Registration Form */}
        <div className='lg:col-span-1'>
          <div className='bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sticky top-20 shadow-xl'>
            <div className='mb-4'>
              <h2 className='text-lg font-bold text-white mb-0.5'>
                {config.cardTitle}
              </h2>
              <p className='text-xs text-neutral-400'>{config.cardSubtitle}</p>
            </div>

            {isRestaurant && (
              <button
                type='button'
                onClick={() => {
                  if (rawIngredients.length > 0 && !selectedBatchIngId) {
                    setSelectedBatchIngId(rawIngredients[0].id);
                  }
                  setShowBatchModal(true);
                }}
                className='w-full mb-4 py-2.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow active:scale-[0.99]'
              >
                <span>🥘</span> Open Batch Prep Calculator
              </button>
            )}

            {formError && (
              <div className='mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-400'>
                {formError}
              </div>
            )}

            <form onSubmit={handleAddIngredient} className='space-y-4'>
              {isRestaurant && (
                <div className='p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between'>
                  <div>
                    <p className='text-xs font-semibold text-neutral-200'>
                      {trackLiveStock
                        ? 'Direct Inventory Item'
                        : 'Raw Cost Basis Material'}
                    </p>
                    <p className='text-[10px] text-neutral-400'>
                      {trackLiveStock
                        ? 'Has live stock count (e.g. Eggs, Rice cups)'
                        : 'Price basis for batch preps (no live stock)'}
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={() => setTrackLiveStock(!trackLiveStock)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                      trackLiveStock ? 'bg-emerald-500' : 'bg-neutral-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black transition-transform ${
                        trackLiveStock ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )}

              <div>
                <label className='block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5'>
                  {config.nameLabel}
                </label>
                <input
                  type='text'
                  required
                  placeholder={config.namePlaceholder}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className='w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition'
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5'>
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className='w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500'
                  >
                    {config.categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5'>
                    Unit
                  </label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className='w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500'
                  >
                    {config.units.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='p-3.5 bg-neutral-950 rounded-xl border border-neutral-800/80 space-y-3'>
                <p className='text-[11px] font-semibold text-neutral-400 uppercase tracking-wider'>
                  Purchasing Price Specs
                </p>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs text-neutral-400 mb-1'>
                      Package Price
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      required
                      placeholder='₱120.00'
                      value={newPackagePrice}
                      onChange={(e) => setNewPackagePrice(e.target.value)}
                      className='w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500'
                    />
                  </div>
                  <div>
                    <label className='block text-xs text-neutral-400 mb-1'>
                      Net Size ({newUnit})
                    </label>
                    <input
                      type='number'
                      required
                      placeholder='1000'
                      value={newPackageSize}
                      onChange={(e) => setNewPackageSize(e.target.value)}
                      className='w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500'
                    />
                  </div>
                </div>

                <div className='flex justify-between items-center pt-2 border-t border-neutral-800 text-xs'>
                  <span className='text-neutral-400'>
                    Calculated Unit Cost:
                  </span>
                  <span className='font-semibold text-emerald-400'>
                    ₱{previewCostPerUnit.toFixed(4)} / {newUnit}
                  </span>
                </div>
              </div>

              {shouldShowStockInputs && (
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5'>
                      Initial Stock (Packs)
                    </label>
                    <input
                      type='number'
                      min='1'
                      value={newInitialPacks}
                      onChange={(e) => setNewInitialPacks(e.target.value)}
                      className='w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5'>
                      Alert Level ({newUnit})
                    </label>
                    <input
                      type='number'
                      placeholder='Min'
                      value={newReorder}
                      onChange={(e) => setNewReorder(e.target.value)}
                      className='w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500'
                    />
                  </div>
                </div>
              )}

              <button
                type='submit'
                disabled={isSubmitting}
                className='w-full mt-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 py-2.5 px-4 text-xs font-bold text-black uppercase tracking-wider transition disabled:opacity-50'
              >
                {isSubmitting ? 'Registering...' : config.submitBtn}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Inventory Table with Tabs */}
        <div className='lg:col-span-2 space-y-4'>
          {isRestaurant && (
            <div className='flex gap-2 border-b border-neutral-800 pb-2'>
              <button
                onClick={() => {
                  setActiveTab('activeStock');
                  setSelectedCategory('All');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'activeStock'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                🥘 Active Stock ({activeStockIngredients.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('rawBasis');
                  setSelectedCategory('All');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'rawBasis'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                🥩 Raw Materials ({rawIngredients.length} price basis)
              </button>
            </div>
          )}

          <div className='flex flex-col sm:flex-row gap-3 items-center justify-between'>
            <input
              type='text'
              placeholder={`Search ${
                activeTab === 'activeStock'
                  ? 'active/prepped supplies'
                  : 'raw materials'
              }...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full sm:w-64 rounded-lg bg-neutral-900 border border-neutral-800 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500'
            />
            <div className='flex flex-wrap gap-1.5 w-full sm:w-auto pb-1'>
              {filterCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-emerald-500 text-black font-semibold'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border border-neutral-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className='bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl'>
            {isLoading ? (
              <div className='p-12 text-center text-xs text-neutral-400'>
                Loading inventory...
              </div>
            ) : fetchError ? (
              <div className='p-8 text-center text-xs text-rose-400'>
                {fetchError}
                <button
                  onClick={loadData}
                  className='block mx-auto mt-2 text-emerald-400 hover:underline'
                >
                  Try Again
                </button>
              </div>
            ) : (
              <table className='w-full text-left text-xs'>
                <thead className='bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 uppercase font-semibold'>
                  <tr>
                    <th className='px-5 py-3.5'>
                      {activeTab === 'activeStock'
                        ? 'Active Supply'
                        : 'Raw Material (Basis)'}
                    </th>
                    <th className='px-4 py-3.5'>Package Specs</th>
                    <th className='px-4 py-3.5'>Unit Cost</th>
                    {(activeTab === 'activeStock' || !isRestaurant) && (
                      <th className='px-4 py-3.5'>Current Stock</th>
                    )}
                    <th className='px-5 py-3.5 text-right'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-neutral-800/60'>
                  {filtered.map((item) => {
                    const isLowStock =
                      item.reorderLevel !== undefined && item.reorderLevel > 0
                        ? item.currentStock <= item.reorderLevel
                        : item.currentStock <= 0;

                    return (
                      <tr
                        key={item.id}
                        className='hover:bg-neutral-800/40 transition'
                      >
                        <td className='px-5 py-4 font-semibold text-neutral-200'>
                          <div className='flex items-center gap-1.5'>
                            {item.itemType === 'prepped' && <span>🥘</span>}
                            {item.name}
                          </div>
                          <span className='text-[10px] text-neutral-500'>
                            {item.category}{' '}
                            {item.itemType ? `• ${item.itemType}` : ''}
                          </span>
                        </td>
                        <td className='px-4 py-4 text-neutral-300'>
                          ₱{(item.packageSpecs?.packagePrice ?? 0).toFixed(2)} /{' '}
                          {item.packageSpecs?.packageSize ?? 0} {item.unit}
                        </td>
                        <td className='px-4 py-4 font-medium text-emerald-400'>
                          ₱{item.costPerUnit.toFixed(4)} / {item.unit}
                        </td>
                        {(activeTab === 'activeStock' || !isRestaurant) && (
                          <td
                            className={`px-4 py-4 font-semibold transition-colors ${
                              isLowStock
                                ? 'text-rose-400 font-bold'
                                : 'text-white'
                            }`}
                          >
                            <div className='flex items-center gap-1.5'>
                              <span>
                                {item.currentStock.toLocaleString()} {item.unit}
                              </span>
                              {isLowStock && (
                                <span className='text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium uppercase tracking-wider'>
                                  Low
                                </span>
                              )}
                            </div>
                          </td>
                        )}
                        <td className='px-5 py-4 whitespace-nowrap text-right'>
                          <div className='flex items-center justify-end gap-2'>
                            <button
                              onClick={() => openRestockModal(item)}
                              className='px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-emerald-400 border border-neutral-700 rounded-lg text-xs transition flex-shrink-0'
                            >
                              Restock / Cost
                            </button>
                            <button
                              onClick={() => handleDeleteIngredient(item)}
                              disabled={deletingId === item.id}
                              className='px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs transition disabled:opacity-50 flex-shrink-0'
                            >
                              {deletingId === item.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {!isLoading && !fetchError && filtered.length === 0 && (
              <div className='p-8 text-center text-neutral-500 text-xs'>
                {activeTab === 'activeStock'
                  ? 'No active stock or prepped items created yet.'
                  : 'No raw basis materials found.'}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Restock & Price Adjustment Modal with Weighted Average Cost */}
      {editingItem && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl'>
            <h3 className='text-base font-bold text-white mb-1'>
              {isRawBasisItem
                ? 'Adjust Material Cost'
                : 'Restock & Adjust Cost'}
            </h3>
            <p className='text-xs text-neutral-400 mb-4'>
              {isRawBasisItem
                ? `Update the purchasing price benchmark for ${editingItem.name}.`
                : `Receive incoming stock for ${editingItem.name}. Unit cost is blended automatically.`}
            </p>

            {editError && (
              <div className='mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-400'>
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveRestockAndPrice} className='space-y-4'>
              {!isRawBasisItem && (
                <div className='p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex justify-between text-xs'>
                  <span className='text-neutral-400'>Current Stock:</span>
                  <span className='font-semibold text-white'>
                    {editingItem.currentStock} {editingItem.unit} @ ₱
                    {editingItem.costPerUnit.toFixed(4)}/ea
                  </span>
                </div>
              )}

              {!isRawBasisItem && (
                <div>
                  <label className='block text-xs text-neutral-400 mb-1'>
                    Incoming Quantity (Number of Packs / Deliveries)
                  </label>
                  <input
                    type='number'
                    min='1'
                    required
                    value={restockPacks}
                    onChange={(e) => setRestockPacks(e.target.value)}
                    className='w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500'
                  />
                </div>
              )}

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-xs text-neutral-400 mb-1'>
                    {isRawBasisItem
                      ? 'New Package Price (₱)'
                      : 'Delivery Price per Pack (₱)'}
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    required
                    value={editPackagePrice}
                    onChange={(e) => setEditPackagePrice(e.target.value)}
                    className='w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500'
                  />
                </div>

                <div>
                  <label className='block text-xs text-neutral-400 mb-1'>
                    Net Size per Pack ({editingItem.unit})
                  </label>
                  <input
                    type='number'
                    required
                    value={editPackageSize}
                    onChange={(e) => setEditPackageSize(e.target.value)}
                    className='w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500'
                  />
                </div>
              </div>

              {/* Live Preview of Weighted Average Result */}
              <div className='p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1 text-xs'>
                {!isRawBasisItem && (
                  <div className='flex justify-between'>
                    <span className='text-neutral-400'>New Total Stock:</span>
                    <span className='font-semibold text-white'>
                      {projectedTotalStock} {editingItem.unit}
                    </span>
                  </div>
                )}
                <div className='flex justify-between items-center pt-1 border-t border-neutral-800/80'>
                  <span className='text-neutral-400'>
                    {isRawBasisItem
                      ? 'New Unit Cost:'
                      : 'New Blended Cost (WAC):'}
                  </span>
                  <span className='text-emerald-400 font-bold'>
                    ₱{projectedBlendedCost.toFixed(4)} / {editingItem.unit}
                  </span>
                </div>
              </div>

              <div className='flex gap-2 pt-2'>
                <button
                  type='button'
                  onClick={() => setEditingItem(null)}
                  className='w-1/2 py-2 text-xs bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 font-medium transition'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isSavingEdit}
                  className='w-1/2 py-2 text-xs bg-emerald-500 hover:bg-emerald-400 rounded-lg text-black font-semibold transition disabled:opacity-50'
                >
                  {isSavingEdit
                    ? 'Saving...'
                    : isRawBasisItem
                      ? 'Save Cost'
                      : 'Confirm Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Prep Modal */}
      {showBatchModal && (
        <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]'>
            <div className='flex justify-between items-start border-b border-neutral-800 pb-3 mb-4'>
              <div>
                <h3 className='text-base font-bold text-white flex items-center gap-2'>
                  <span>🥘</span> Batch Prep Cost Calculator
                </h3>
                <p className='text-xs text-neutral-400 mt-0.5'>
                  Combine raw ingredients into prepped portions (e.g. Marinated
                  Beef Tapa).
                </p>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className='text-neutral-500 hover:text-white text-lg leading-none'
              >
                ✕
              </button>
            </div>

            <div className='overflow-y-auto flex-1 space-y-4 pr-1'>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                <div className='sm:col-span-2'>
                  <label className='block text-xs text-neutral-400 mb-1'>
                    Prepped Item Name
                  </label>
                  <input
                    type='text'
                    placeholder='e.g. Prepped Beef Tapa'
                    value={batchItemName}
                    onChange={(e) => setBatchItemName(e.target.value)}
                    className='w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500'
                  />
                </div>

                <div>
                  <label className='block text-xs text-neutral-400 mb-1'>
                    Yield (Portions)
                  </label>
                  <input
                    type='number'
                    placeholder='125'
                    value={batchYieldPortions}
                    onChange={(e) => setBatchYieldPortions(e.target.value)}
                    className='w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500'
                  />
                </div>
              </div>

              <div className='p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3'>
                <p className='text-[11px] font-semibold text-neutral-400 uppercase tracking-wider'>
                  Add Raw Material to Batch
                </p>
                <div className='grid grid-cols-1 sm:grid-cols-12 gap-2 items-end'>
                  <div className='sm:col-span-6'>
                    <label className='block text-[11px] text-neutral-500 mb-1'>
                      Raw Basis Item
                    </label>
                    <select
                      value={
                        selectedBatchIngId ||
                        (activeBatchSelected ? activeBatchSelected.id : '')
                      }
                      onChange={(e) => setSelectedBatchIngId(e.target.value)}
                      className='w-full rounded-lg bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500'
                    >
                      {rawIngredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} (₱{Number(ing.costPerUnit || 0).toFixed(4)}
                          /{ing.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='sm:col-span-3'>
                    <label className='block text-[11px] text-neutral-500 mb-1'>
                      Amount ({activeBatchSelected?.unit || 'unit'})
                    </label>
                    <input
                      type='number'
                      step='any'
                      placeholder={
                        activeBatchSelected?.unit === 'ml' ? '1500' : '1000'
                      }
                      value={batchIngAmount}
                      onChange={(e) => setBatchIngAmount(e.target.value)}
                      className='w-full rounded-lg bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500'
                    />
                  </div>

                  <div className='sm:col-span-3'>
                    <button
                      type='button'
                      onClick={handleAddIngredientToBatch}
                      className='w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition'
                    >
                      + Add
                    </button>
                  </div>
                </div>

                <div className='border border-neutral-800 rounded-lg overflow-hidden mt-2'>
                  <table className='w-full text-left text-xs'>
                    <thead className='bg-neutral-900 text-neutral-400 uppercase font-semibold'>
                      <tr>
                        <th className='px-3 py-2'>Raw Ingredient</th>
                        <th className='px-2 py-2'>Amount</th>
                        <th className='px-2 py-2'>Cost</th>
                        <th className='px-2 py-2 text-right'>Action</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-neutral-800/60'>
                      {batchRecipe.map((b) => (
                        <tr key={b.ingredientId}>
                          <td className='px-3 py-2 text-neutral-200'>
                            {b.name}
                          </td>
                          <td className='px-2 py-2 text-neutral-400'>
                            {b.amount} {b.unit}
                          </td>
                          <td className='px-2 py-2 text-emerald-400 font-medium'>
                            ₱{b.totalCost.toFixed(2)}
                          </td>
                          <td className='px-2 py-2 text-right'>
                            <button
                              onClick={() =>
                                handleRemoveBatchIngredient(b.ingredientId)
                              }
                              className='text-neutral-500 hover:text-rose-400 text-xs'
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {batchRecipe.length === 0 && (
                    <div className='p-4 text-center text-xs text-neutral-500'>
                      No ingredients added to this batch yet.
                    </div>
                  )}
                </div>
              </div>

              <div className='p-4 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between text-xs'>
                <div>
                  <span className='text-neutral-400 block'>
                    Total Batch Cost:
                  </span>
                  <span className='text-base font-bold text-white'>
                    ₱{totalBatchCost.toFixed(2)}
                  </span>
                </div>
                <div className='text-right'>
                  <span className='text-neutral-400 block'>
                    Portion Cost ({yieldCount} yields):
                  </span>
                  <span className='text-base font-bold text-emerald-400'>
                    ₱{computedUnitCostPerPortion.toFixed(4)} / portion
                  </span>
                </div>
              </div>
            </div>

            <div className='flex gap-2 pt-4 border-t border-neutral-800 mt-4'>
              <button
                type='button'
                onClick={() => setShowBatchModal(false)}
                className='w-1/3 py-2 text-xs bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 font-medium transition'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={handleSaveBatchAsIngredient}
                disabled={
                  isSubmitting ||
                  !batchItemName.trim() ||
                  batchRecipe.length === 0
                }
                className='w-2/3 py-2 text-xs bg-emerald-500 hover:bg-emerald-400 rounded-lg text-black font-bold uppercase tracking-wider transition disabled:opacity-50'
              >
                {isSubmitting ? 'Saving...' : 'Save as Active Batch Inventory'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};