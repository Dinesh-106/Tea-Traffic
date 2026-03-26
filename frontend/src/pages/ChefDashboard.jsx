import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChefHat, CheckSquare, XSquare, Clock } from 'lucide-react';

export default function ChefDashboard() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders?status=Pending');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch pending orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/orders/${id}/status`, { status });
      if (status === 'Rejected') {
        alert('Order Rejected. Order Staff will be notified implicitly (via status).');
      }
      setOrders(orders.filter(o => o._id !== id));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-extrabold flex items-center gap-4 text-white drop-shadow-xl tracking-tight">
          <div className="bg-brand-orange-500/20 backdrop-blur-md p-3 rounded-2xl border border-brand-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
            <ChefHat className="text-brand-orange-400" size={32} />
          </div>
          Chef Dashboard
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-200 bg-black/40 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-2xl border border-white/10">
          <Clock size={16} className="text-brand-orange-400 animate-pulse" /> Auto-updating every 5s
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-32 text-gray-400 text-lg font-medium animate-pulse">Loading kitchen orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-16 text-center flex flex-col items-center justify-center">
          <div className="bg-white/5 p-6 rounded-full mb-6 border border-white/10">
            <ChefHat size={64} className="text-white/20" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">No pending orders</h3>
          <p className="text-gray-400 text-lg">The kitchen is clear. Waiting for new traffic!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <div key={order._id} className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl hover:bg-black/50 transition-all duration-300 relative flex flex-col overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-orange-500 to-yellow-500"></div>
              
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3">
                  <span className="bg-brand-orange-500 text-white text-sm font-black px-3 py-1.5 rounded-lg shadow-md">
                    Table {order.tableNumber}
                  </span>
                  <span className="text-xs text-brand-orange-400/80 font-mono tracking-widest">#{order._id.slice(-6).toUpperCase()}</span>
                </div>
                <span className="text-xs font-bold text-brand-orange-300 bg-brand-orange-500/20 px-3 py-1.5 rounded-lg border border-brand-orange-500/30 flex items-center gap-2 uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-brand-orange-400 animate-pulse"></span>
                  Pending
                </span>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                <ul className="space-y-4">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-base">
                      <span className="bg-white/10 text-white w-8 h-8 flex text-center justify-center items-center rounded-lg font-bold border border-white/5 shadow-inner flex-shrink-0">
                        {item.quantity}
                      </span>
                      <span className="font-medium text-gray-200 mt-1 leading-tight">
                        {item.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 border-t border-white/10 bg-black/60 grid grid-cols-2 gap-4 rounded-b-3xl">
                <button 
                  onClick={() => updateStatus(order._id, 'Accepted')}
                  className="flex items-center justify-center gap-2 py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold hover:bg-emerald-500 hover:text-white transition-all shadow-lg text-sm group"
                >
                  <CheckSquare size={18} className="group-hover:scale-110 transition-transform" /> Accept
                </button>
                <button 
                  onClick={() => updateStatus(order._id, 'Rejected')}
                  className="flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all shadow-lg text-sm group"
                >
                  <XSquare size={18} className="group-hover:scale-110 transition-transform" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
