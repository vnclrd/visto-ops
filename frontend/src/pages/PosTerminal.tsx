import React, { useState, useEffect } from 'react';
import type { ClientAccount, StoreItem, MenuItemRecord, CartItem } from '../types';
import { verifyOwnerPin } from '../services/authApi';
import { fetchCatalog } from '../services/catalogApi';

interface PosTerminalProps {
  account: ClientAccount;
  store: StoreItem;
  onLogout: () => void;
  onSwitchStore: () => void;
  onOpenOwnerDashboard: () => void;
}

export const PosTerminal: React.FC<PosTerminalProps> = ({
  account,
  store,
  onLogout,
  onSwitchStore,
  onOpenOwnerDashboard,
}) => {
  const [catalog, setCatalog] = useState<MenuItemRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);

  // PIN Modal State
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  const loadStoreCatalog = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const items = await fetchCatalog(account.id, store.id);
      setCatalog(items.filter((item) => item.isActive !== false));
    } catch (err: any) {
      setFetchError(err.message || 'Failed to fetch catalog items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStoreCatalog();
  }, [account.id, store.id]);

  const categories = [
    'All',
    ...Array.from(new Set(catalog.map((i) => i.category).filter(Boolean))),
  ];

  const filteredItems =
    selectedCategory === 'All'
      ? catalog
      : catalog.filter((i) => i.category === selectedCategory);

  const addToCart = (item: MenuItemRecord) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci,
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          isAvailable: item.isActive,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null),
    );
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    try {
      await verifyOwnerPin(account.id, enteredPin);
      setShowPinModal(false);
      setEnteredPin('');
      onOpenOwnerDashboard();
    } catch (err: any) {
      setPinError(err.message || 'Invalid PIN');
      setEnteredPin('');
    }
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className='flex flex-col h-screen bg-neutral-900 text-white select-none relative'>
      {/* 1. Header */}
      <header className='h-14 border-b border-neutral-800 px-6 flex items-center justify-between bg-neutral-950'>
        <div className='flex items-center gap-3'>
          <span className='font-bold text-lg text-emerald-400'>VistoOps</span>
          <span className='text-neutral-500'>|</span>
          <span className='text-sm font-medium text-neutral-300'>
            {store.name || store.id}
          </span>
          <button
            onClick={onSwitchStore}
            className='text-xs text-neutral-400 hover:text-white underline ml-1'
          >
            (switch)
          </button>
        </div>

        <div className='flex items-center gap-3 text-sm'>
          <button
            onClick={() => {
              setPinError(null);
              setEnteredPin('');
              setShowPinModal(true);
            }}
            className='px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-emerald-500/30 text-xs font-medium rounded transition'
          >
            Owner Dashboard
          </button>

          <span className='text-neutral-500'>|</span>

          <span className='text-neutral-400 text-xs'>
            User: <strong className='text-neutral-200'>{account.name}</strong>
          </span>
          <button
            onClick={onLogout}
            className='px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded transition'
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className='flex flex-1 overflow-hidden'>
        {/* 2. Side Panel (Left): Cart / Current Order */}
        <aside className='w-80 border-r border-neutral-800 bg-neutral-950 flex flex-col justify-between p-5'>
          <div className='flex-1 overflow-y-auto'>
            <h3 className='text-base font-semibold border-b border-neutral-800 pb-3 mb-4'>
              Current Order
            </h3>

            {cart.length === 0 ? (
              <p className='text-sm text-neutral-500 mt-10 text-center'>
                Cart is empty
              </p>
            ) : (
              <div className='space-y-3'>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className='flex items-center justify-between text-sm py-2 border-b border-neutral-800/50'
                  >
                    <div>
                      <p className='font-medium text-neutral-200'>
                        {item.name}
                      </p>
                      <p className='text-xs text-neutral-400'>
                        ₱{item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className='w-6 h-6 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300'
                      >
                        -
                      </button>
                      <span className='text-xs font-semibold w-4 text-center'>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className='w-6 h-6 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300'
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary & Checkout */}
          <div className='border-t border-neutral-800 pt-4 mt-4'>
            <div className='flex justify-between items-center mb-4'>
              <span className='text-sm text-neutral-400'>Total</span>
              <span className='text-xl font-bold text-white'>
                ₱{totalAmount.toFixed(2)}
              </span>
            </div>
            <button
              disabled={cart.length === 0}
              className='w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition'
            >
              Charge ₱{totalAmount.toFixed(2)}
            </button>
          </div>
        </aside>

        {/* 3. Main Panel (Right): Menu Catalog & Categories */}
        <main className='flex-1 flex flex-col p-6 overflow-hidden'>
          {/* Category Pills */}
          <div className='flex gap-2 mb-6 overflow-x-auto pb-1'>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-black font-semibold'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className='flex-1 overflow-y-auto'>
            {isLoading ? (
              <div className='flex items-center justify-center h-48 text-neutral-400 text-sm'>
                Loading menu catalog...
              </div>
            ) : fetchError ? (
              <div className='p-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl text-center'>
                {fetchError}
                <button
                  onClick={loadStoreCatalog}
                  className='block mx-auto mt-2 text-emerald-400 hover:underline'
                >
                  Retry Loading
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className='flex items-center justify-center h-48 text-neutral-500 text-sm'>
                No items published in this category yet.
              </div>
            ) : (
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className='p-4 bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700 rounded-xl flex flex-col justify-between text-left transition h-32 active:scale-95'
                  >
                    <div>
                      <h4 className='font-semibold text-neutral-100 line-clamp-2'>
                        {item.name}
                      </h4>
                      <p className='text-xs text-neutral-400 mt-1'>
                        {item.category}
                      </p>
                    </div>
                    <span className='font-medium text-emerald-400'>
                      ₱{item.price.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-neutral-900 border border-neutral-800 rounded-xl max-w-sm w-full p-6 shadow-xl'>
            <h3 className='text-lg font-semibold text-white text-center mb-1'>
              Owner Verification
            </h3>
            <p className='text-xs text-neutral-400 text-center mb-4'>
              Enter the owner PIN for {account.owner || account.name}
            </p>

            {pinError && (
              <div className='bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded p-2 text-center mb-4'>
                {pinError}
              </div>
            )}

            <form onSubmit={handlePinSubmit}>
              <input
                type='password'
                maxLength={6}
                autoFocus
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder='Enter PIN'
                className='w-full text-center tracking-widest text-xl py-2 px-3 bg-neutral-950 border border-neutral-700 rounded-lg text-white mb-4 focus:outline-none focus:border-emerald-500'
              />

              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() => setShowPinModal(false)}
                  className='w-1/2 py-2 text-xs bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 font-medium transition'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='w-1/2 py-2 text-xs bg-emerald-500 hover:bg-emerald-400 rounded text-black font-semibold transition'
                >
                  Confirm PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};