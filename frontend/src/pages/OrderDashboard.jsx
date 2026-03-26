import React, { useState, useMemo } from 'react';
import { Plus, Minus, ShoppingCart, Coffee, Send, X, Navigation } from 'lucide-react';
import { createOrder } from '../services/storage';
import menuData from '../data/menu.json';

export default function OrderDashboard() {
  const [cart, setCart] = useState([]);
  const [tableNumber, setTableNumber] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const menus = menuData.filter(item => item.available);
  const categories = ['All', ...new Set(menus.map(item => item.category))];
  const filteredMenu = activeCategory === 'All' ? menus : menus.filter(m => m.category === activeCategory);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === item.id);
      if (existing) return prev.map(p => p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === itemId);
      if (existing.quantity === 1) {
        const newCart = prev.filter(p => p.id !== itemId);
        if (newCart.length === 0) setIsCartOpen(false);
        return newCart;
      }
      return prev.map(p => p.id === itemId ? { ...p, quantity: p.quantity - 1 } : p);
    });
  };

  const totalCost = useMemo(() => cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0), [cart]);

  const submitOrder = () => {
    if (!tableNumber) return alert('Please enter a table number');
    if (cart.length === 0) return alert('Cart is empty');

    setIsSubmitting(true);
    try {
      const items = cart.map(c => ({ name: c.name, quantity: c.quantity, price: c.price }));
      createOrder({ tableNumber: Number(tableNumber), items });
      setSuccessMsg(`Order placed successfully for Table ${tableNumber}!`);
      setCart([]);
      setTableNumber('');
      setIsCartOpen(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {
      alert('Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-auto lg:h-[calc(100vh-8rem)] pb-24 lg:pb-0 relative">

      {/* Menu Section */}
      <div className="flex-1 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        <div className="p-5 md:p-6 border-b border-white/10 bg-white/5 flex-shrink-0">
          <h2 className="text-2xl font-bold flex items-center gap-3 mb-5 text-white drop-shadow-md">
            <Coffee className="text-brand-orange-500" /> Discover Menu
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`snap-start px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${activeCategory === cat
                    ? 'bg-gradient-to-r from-brand-orange-500 to-amber-500 text-white shadow-[0_4px_15px_rgba(249,115,22,0.4)] transform scale-105'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/5 hover:text-white'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 h-max">
            {filteredMenu.map(item => {
              const imgName = item.name.toLowerCase().replace(/ /g, '_') + '.png';
              return (
                <div key={item.id} className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg hover:bg-white/20 hover:border-white/20 transition-all duration-300 group flex flex-col justify-between overflow-hidden">
                  <div className="h-44 w-full bg-black/50 overflow-hidden relative">
                    <img
                      src={`/img/${imgName}`}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <span className="absolute top-3 right-3 text-sm text-white font-black bg-brand-orange-500 px-3 py-1 rounded-lg shadow-lg">₹{item.price}</span>
                    <span className="absolute bottom-3 left-3 text-[11px] text-white font-bold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md uppercase tracking-wider border border-white/20">{item.category}</span>
                  </div>
                  <div className="p-5 flex flex-col flex-1 bg-gradient-to-b from-transparent to-black/40">
                    <h3 className="font-bold text-xl text-white line-clamp-1 mb-4 drop-shadow-sm">{item.name}</h3>
                    <button
                      onClick={() => addToCart(item)}
                      className="mt-auto w-full py-3 bg-brand-orange-500/20 text-brand-orange-400 border border-brand-orange-500/30 rounded-xl group-hover:bg-brand-orange-500 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 font-bold text-sm"
                    >
                      <Plus size={18} /> Add to Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      {!isCartOpen && cart.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-40 lg:hidden fade-in">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-brand-orange-500 to-amber-500 text-white py-4 px-6 rounded-2xl font-bold shadow-[0_10px_30px_rgba(249,115,22,0.5)] flex items-center justify-between active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg"><ShoppingCart size={20} /></div>
              <span className="text-lg">{cart.reduce((a, c) => a + c.quantity, 0)} Items</span>
            </div>
            <span className="text-xl tracking-tight">₹{totalCost} &rarr;</span>
          </button>
        </div>
      )}

      {/* Cart Sidebar */}
      <div className={`
        fixed inset-0 z-50 lg:static lg:inset-auto lg:z-auto
        ${isCartOpen ? 'flex' : 'hidden lg:flex'}
        w-full lg:w-[28rem] flex-col gap-6
        bg-black/80 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none p-4 lg:p-0 transition-all duration-300
      `}>
        <div className="bg-black/90 lg:bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl flex flex-col h-full lg:h-full overflow-hidden relative mt-auto lg:mt-0 max-h-[90vh] lg:max-h-full slide-up lg:animate-none">

          <div className="px-6 py-5 border-b border-white/10 bg-white/5 flex items-center justify-between flex-shrink-0">
            <h2 className="text-xl font-bold flex items-center gap-3 text-white">
              <div className="p-2 bg-brand-orange-500/20 rounded-lg border border-brand-orange-500/30">
                <ShoppingCart className="text-brand-orange-400" size={20} />
              </div>
              Current Order
            </h2>
            <div className="flex items-center gap-3">
              {cart.length > 0 && <span className="bg-gradient-to-r from-brand-orange-500 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-orange-500/30">{cart.reduce((a, c) => a + c.quantity, 0)} Items</span>}
              <button onClick={() => setIsCartOpen(false)} className="lg:hidden p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" aria-label="Close cart">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 border-b border-white/10 bg-black/40 flex flex-col gap-2 flex-shrink-0">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Table Destination</label>
            <div className="relative">
              <Navigation className="absolute left-4 top-3.5 text-brand-orange-500" size={18} />
              <input
                type="number" min="1" placeholder="Enter table number..." value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange-500 focus:border-brand-orange-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {successMsg && (
              <div className="bg-emerald-500/20 text-emerald-300 p-4 rounded-xl text-sm border border-emerald-500/30 flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-pulse">
                <span className="font-bold">{successMsg}</span>
                <button onClick={() => setSuccessMsg('')} className="shrink-0 hover:text-emerald-100"><X size={18} /></button>
              </div>
            )}

            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 opacity-70">
                <div className="p-4 rounded-full bg-white/5 border border-white/10">
                  <ShoppingCart size={48} className="text-gray-500" />
                </div>
                <p className="text-sm font-medium tracking-wide">Your cart is empty</p>
                <button onClick={() => setIsCartOpen(false)} className="lg:hidden mt-2 text-brand-orange-400 font-bold text-sm">Browse Menu</button>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center justify-between group text-sm bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex-1 pr-3">
                    <h4 className="font-bold text-gray-200 line-clamp-1 text-base">{item.name}</h4>
                    <p className="text-brand-orange-400 font-semibold mt-0.5">₹{item.price * item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-black/50 border border-white/10 rounded-lg p-1 min-w-[90px] justify-between">
                    <button onClick={() => removeFromCart(item.id)} className="p-1.5 rounded-md text-gray-300 hover:bg-white/20 hover:text-white transition-colors active:scale-95"><Minus size={14} /></button>
                    <span className="font-bold w-4 text-center text-white">{item.quantity}</span>
                    <button onClick={() => addToCart(item)} className="p-1.5 rounded-md text-gray-300 hover:bg-white/20 hover:text-white transition-colors active:scale-95"><Plus size={14} /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t border-white/10 bg-black/60 flex-shrink-0">
            <div className="flex justify-between items-end mb-5">
              <span className="text-gray-400 font-semibold text-sm uppercase tracking-widest">Total Cost</span>
              <span className="text-4xl font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">₹{totalCost}</span>
            </div>
            <button
              onClick={submitOrder}
              disabled={cart.length === 0 || isSubmitting || !tableNumber}
              className="w-full py-4 bg-gradient-to-r from-brand-orange-500 to-amber-500 text-white rounded-xl font-bold text-base shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] disabled:opacity-50 disabled:shadow-none hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Routing to Kitchen...' : 'Send Order to Kitchen'} {!isSubmitting && <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
