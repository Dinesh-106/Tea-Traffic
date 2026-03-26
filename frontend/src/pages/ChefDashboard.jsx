import React, { useEffect, useState } from 'react';
import { ChefHat, CheckSquare, XSquare, Clock } from 'lucide-react';
import { getOrders, updateOrderStatus } from '../services/storage';

export default function ChefDashboard() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = () => {
    setOrders(getOrders('Pending'));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = (id, status) => {
    try {
      updateOrderStatus(id, status);
      if (status === 'Rejected') {
        alert('Order Rejected. Order Staff will be notified implicitly (via status).');
      }
      setOrders(orders.filter(o => o._id !== id));
    } catch {
      alert('Failed to update status');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-extrabold flex items-center gap-4 text-gray-900 tracking-tight drop-shadow-sm">
          <div className="bg-yellow-400 p-3 rounded-2xl border border-yellow-500 shadow-sm">
            <ChefHat className="text-yellow-900" size={32} />
          </div>
          Chef Dashboard
        </h2>
        <div className="flex items-center gap-2 text-sm text-yellow-900 bg-yellow-400/90 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-md border border-yellow-500">
          <Clock size={16} className="text-yellow-800 animate-pulse" /> Auto-updating every 3s
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-32 text-yellow-500 font-bold animate-pulse text-xl drop-shadow-lg">Loading kitchen orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-yellow-400/95 backdrop-blur-2xl rounded-3xl border border-yellow-500 shadow-2xl p-16 text-center flex flex-col items-center justify-center">
          <div className="bg-yellow-300 p-6 rounded-full mb-6 border border-yellow-400 shadow-inner">
            <ChefHat size={64} className="text-yellow-700/50" />
          </div>
          <h3 className="text-3xl font-black text-yellow-900 mb-2">No pending orders</h3>
          <p className="text-yellow-800 font-medium text-lg">The kitchen is clear. Waiting for new traffic!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <div key={order._id} className="bg-yellow-50/95 backdrop-blur-xl rounded-3xl border border-yellow-300 shadow-xl hover:shadow-2xl transition-all duration-300 relative flex flex-col overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>

              <div className="p-6 border-b border-yellow-200 flex justify-between items-center bg-yellow-100/50">
                <div className="flex items-center gap-3">
                  <span className="bg-yellow-500 text-yellow-900 text-sm font-black px-3 py-1.5 rounded-lg shadow-sm border border-yellow-600">
                    Table {order.tableNumber}
                  </span>
                  <span className="text-xs text-yellow-600 font-mono font-bold tracking-widest">#{order._id.slice(-6).toUpperCase()}</span>
                </div>
                <span className="text-xs font-bold text-yellow-800 bg-yellow-300 px-3 py-1.5 rounded-lg border border-yellow-400 flex items-center gap-2 uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-yellow-600 animate-pulse"></span>
                  Pending
                </span>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                <ul className="space-y-4">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-base">
                      <span className="bg-yellow-200 text-yellow-900 w-8 h-8 flex text-center justify-center items-center rounded-lg font-black border border-yellow-300 shadow-sm flex-shrink-0">
                        {item.quantity}
                      </span>
                      <span className="font-bold text-gray-900 mt-1 leading-tight">{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 border-t border-yellow-200 bg-yellow-100/80 grid grid-cols-2 gap-4 rounded-b-3xl">
                <button
                  onClick={() => updateStatus(order._id, 'Accepted')}
                  className="flex items-center justify-center gap-2 py-3 bg-emerald-400 text-white border border-emerald-500 rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-md text-sm group"
                >
                  <CheckSquare size={18} className="group-hover:scale-110 transition-transform" /> Accept
                </button>
                <button
                  onClick={() => updateStatus(order._id, 'Rejected')}
                  className="flex items-center justify-center gap-2 py-3 bg-red-400 text-white border border-red-500 rounded-xl font-bold hover:bg-red-500 transition-all shadow-md text-sm group"
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
