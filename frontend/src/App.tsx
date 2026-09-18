import { useState, type FormEvent } from 'react';
import { 
  Store, 
  Coffee, 
  ChevronRight, 
  LogOut, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Trash2, 
  ShieldCheck, 
  X, 
  TrendingUp,
} from 'lucide-react';
import type { BusinessAccount, StoreBranch, MenuItem, CartItem } from './types/store';
import { MOCK_BUSINESS, MOCK_BRANCHES, MOCK_MENUS } from './data/mockStores';

export default function App() {
  // Navigation & Session
  const [account, setAccount] = useState<BusinessAccount | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<StoreBranch | null>(null);

  // Login credentials state
  const [email, setEmail] = useState('ops@gatchacoffee.com');
  const [password, setPassword] = useState('secret123');

  // Staff POS state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Owner Portal PIN state
  const [showOwnerPinModal, setShowOwnerPinModal] = useState(false);
  const [ownerPinInput, setOwnerPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState(false);

  // --- Handlers ---
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setAccount(MOCK_BUSINESS);
    }
  };

  const handleLogout = () => {
    setAccount(null);
    setSelectedBranch(null);
    setCart([]);
    setIsOwnerUnlocked(false);
    setShowOwnerPinModal(false);
  };

  const addToCart = (item: MenuItem) => {
    if (!item.inStock) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
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
        .filter(Boolean) as CartItem[]
    );
  };

  const verifyOwnerPin = (pin: string) => {
    if (selectedBranch && pin === selectedBranch.ownerPin) {
      setIsOwnerUnlocked(true);
      setShowOwnerPinModal(false);
      setOwnerPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
      setTimeout(() => setOwnerPinInput(''), 600);
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (ownerPinInput.length < 4) {
      const nextPin = ownerPinInput + digit;
      setOwnerPinInput(nextPin);
      setPinError(false);
      if (nextPin.length === 4) {
        verifyOwnerPin(nextPin);
      }
    }
  };

  // Calculations for POS & Metrics
  const cartTotal = cart.reduce((acc, item) => acc + item.basePrice * item.quantity, 0);
  const cartCogs = cart.reduce((acc, item) => acc + item.estimatedCost * item.quantity, 0);
  const cartGrossMargin = cartTotal - cartCogs;

  // ==========================================
  // VIEW 1: BUSINESS ACCOUNT LOGIN
  // ==========================================
  if (!account) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-neutral-950 p-4 select-none">
        <div className="w-full max-w-sm rounded-3xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white">VistoOps</h1>
            <p className="mt-1 text-xs text-neutral-400">Store Terminal Authentication</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300">Business Account Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm text-white focus:border-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm text-white focus:border-white focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-white text-sm font-bold text-neutral-900 transition active:scale-[0.98] hover:bg-neutral-200"
            >
              Sign In to Stores
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: SELECT STORE / BRANCH
  // ==========================================
  if (!selectedBranch) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-neutral-950 p-6 select-none">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Select Active Store</h2>
              <p className="text-xs text-neutral-400">{account.businessName} ({account.email})</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>

          <div className="space-y-3">
            {MOCK_BRANCHES.map((branch) => (
              <button
                key={branch.id}
                onClick={() => {
                  setSelectedBranch(branch);
                  setCart([]);
                  setIsOwnerUnlocked(false);
                }}
                className="flex w-full items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-left transition hover:border-neutral-700 hover:bg-neutral-800/80 active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 text-white">
                    <Store className="h-6 w-6 text-neutral-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{branch.name}</h3>
                    <p className="text-xs text-neutral-400">{branch.location}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-neutral-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: STAFF STORE TERMINAL (70/30 POS)
  // ==========================================
  const activeMenu: MenuItem[] = MOCK_MENUS[selectedBranch.id] || [];
  const categories = ['All', ...Array.from(new Set(activeMenu.map((i) => i.category)))];
  const filteredMenu = selectedCategory === 'All'
    ? activeMenu
    : activeMenu.filter((i) => i.category === selectedCategory);

  return (
    <div className="flex h-screen w-screen flex-col bg-neutral-950 text-white select-none">
      {/* Top Navigation Bar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-800 px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedBranch(null);
              setIsOwnerUnlocked(false);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold">{selectedBranch.name}</h1>
              <span className="rounded-md bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                POS ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">{selectedBranch.location}</p>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isOwnerUnlocked) {
                setIsOwnerUnlocked(false);
              } else {
                setShowOwnerPinModal(true);
              }
            }}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              isOwnerUnlocked
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            {isOwnerUnlocked ? 'Lock Owner Hub' : 'Owner Dashboard'}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition"
          >
            <LogOut className="h-4 w-4" />
            Exit
          </button>
        </div>
      </header>

      {/* Main Screen Split: Staff Catalog (70%) + Live Ticket (30%) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Menu Items */}
        <div className="flex flex-1 flex-col overflow-y-auto p-6 border-r border-neutral-800">
          {/* Owner Metrics Banner (Only rendered if unlocked via PIN) */}
          {isOwnerUnlocked && (
            <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <TrendingUp className="h-4 w-4" />
                  Owner Margin Dashboard Unlocked
                </div>
                <span className="text-[11px] text-neutral-400 font-mono">Store PIN: {selectedBranch.ownerPin}</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-neutral-900/80 p-3 border border-neutral-800">
                  <div className="text-[11px] text-neutral-400">Current Order Est. COGS</div>
                  <div className="mt-1 text-sm font-bold text-neutral-200">{selectedBranch.currency}{cartCogs.toFixed(2)}</div>
                </div>
                <div className="rounded-xl bg-neutral-900/80 p-3 border border-neutral-800">
                  <div className="text-[11px] text-neutral-400">Current Order Est. Margin</div>
                  <div className="mt-1 text-sm font-bold text-emerald-400">+{selectedBranch.currency}{cartGrossMargin.toFixed(2)}</div>
                </div>
                <div className="rounded-xl bg-neutral-900/80 p-3 border border-neutral-800">
                  <div className="text-[11px] text-neutral-400">Daily Projected Net</div>
                  <div className="mt-1 text-sm font-bold text-white">68.4%</div>
                </div>
              </div>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-4 shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-white text-neutral-950'
                    : 'border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Item Grid for Staff to Tap */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 mt-2">
            {filteredMenu.map((item) => (
              <button
                key={item.id}
                disabled={!item.inStock}
                onClick={() => addToCart(item)}
                className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition active:scale-95 ${
                  item.inStock
                    ? 'border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:bg-neutral-850'
                    : 'opacity-40 border-neutral-900 bg-neutral-950 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-neutral-500">{item.category}</span>
                    <Coffee className="h-4 w-4 text-neutral-400" />
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-white">{item.name}</h3>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    {selectedBranch.currency}{item.basePrice.toFixed(2)}
                  </span>
                  {isOwnerUnlocked && (
                    <span className="text-[11px] font-mono text-emerald-400">
                      Margin: +{selectedBranch.currency}{(item.basePrice - item.estimatedCost).toFixed(0)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Staff Live Order Ticket (30%) */}
        <div className="flex w-96 flex-col bg-neutral-900 p-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h2 className="text-sm font-bold tracking-tight">Active Ticket</h2>
            <button
              onClick={() => setCart([])}
              className="text-xs text-neutral-400 hover:text-rose-400 transition"
            >
              Clear
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-neutral-500">
                <Coffee className="h-8 w-8 mb-2 stroke-[1.5]" />
                <p className="text-xs">No items rung up yet.</p>
                <p className="text-[11px] text-neutral-600">Tap products on the left to add.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl bg-neutral-950 p-3 border border-neutral-800"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-xs font-semibold text-white truncate">{item.name}</h4>
                    <p className="text-[11px] font-mono text-neutral-400">
                      {selectedBranch.currency}{item.basePrice.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    >
                      {item.quantity === 1 ? <Trash2 className="h-3 w-3 text-rose-400" /> : <Minus className="h-3 w-3" />}
                    </button>
                    <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ticket Total & Charge Button */}
          <div className="border-t border-neutral-800 pt-4">
            <div className="flex justify-between text-xs text-neutral-400">
              <span>Subtotal</span>
              <span>{selectedBranch.currency}{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white mt-1">
              <span>Total Due</span>
              <span>{selectedBranch.currency}{cartTotal.toFixed(2)}</span>
            </div>

            <button
              disabled={cart.length === 0}
              className="mt-4 flex h-13 w-full items-center justify-center rounded-2xl bg-white font-bold text-neutral-950 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Collect {selectedBranch.currency}{cartTotal.toFixed(2)}
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================
          MODAL: OWNER 4-DIGIT PIN PROMPT
      ========================================== */}
      {showOwnerPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-xs rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Owner Verification</h3>
              <button
                onClick={() => {
                  setShowOwnerPinModal(false);
                  setOwnerPinInput('');
                  setPinError(false);
                }}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400 text-center mb-6">
              Enter the 4-digit store owner PIN for {selectedBranch.name}.
            </p>

            {/* PIN Dots */}
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((index) => {
                const filled = ownerPinInput.length > index;
                return (
                  <div
                    key={index}
                    className={`h-4 w-4 rounded-full transition-all duration-150 ${
                      pinError
                        ? 'bg-rose-500 scale-110 animate-bounce'
                        : filled
                        ? 'bg-emerald-500 scale-105'
                        : 'bg-neutral-800'
                    }`}
                  />
                );
              })}
            </div>

            {pinError && (
              <p className="text-center text-xs font-semibold text-rose-500 mb-4">
                Incorrect PIN. Please try again.
              </p>
            )}

            {/* Touch Keypad */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleKeypadPress(digit)}
                  className="flex h-14 items-center justify-center rounded-xl bg-neutral-800 text-lg font-bold text-white transition active:scale-95 hover:bg-neutral-700"
                >
                  {digit}
                </button>
              ))}
              <div />
              <button
                onClick={() => handleKeypadPress('0')}
                className="flex h-14 items-center justify-center rounded-xl bg-neutral-800 text-lg font-bold text-white transition active:scale-95 hover:bg-neutral-700"
              >
                0
              </button>
              <button
                onClick={() => setOwnerPinInput((prev) => prev.slice(0, -1))}
                className="flex h-14 items-center justify-center rounded-xl bg-neutral-800 text-neutral-400 transition active:scale-95 hover:text-white hover:bg-neutral-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-4 text-center text-[10px] text-neutral-500 font-mono">
              Demo PIN: {selectedBranch.ownerPin}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}