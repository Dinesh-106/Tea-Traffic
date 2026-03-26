import React, { useEffect, useState } from 'react';
import { ReceiptCent, CheckCircle2, Clock } from 'lucide-react';
import { getOrders, updateOrderStatus } from '../services/storage';

export default function BillingDashboard() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = () => {
    setOrders(getOrders('Accepted'));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const finalizeBill = (id) => {
    try {
      updateOrderStatus(id, 'Billed');
      setOrders(orders.filter(o => o._id !== id));
      alert('Order billed successfully and removed from active list.');
    } catch {
      alert('Failed to finalize bill');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-extrabold flex items-center gap-4 text-white tracking-tight">
          <div className="bg-emerald-500/20 p-3 rounded-2xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <ReceiptCent className="text-emerald-400" size={32} />
          </div>
          Billing Center
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-900/80 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-md border border-gray-800">
          <Clock size={16} className="text-emerald-500 animate-pulse" /> Auto-updating every 3s
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-32 text-gray-400 font-medium animate-pulse text-xl">Loading active bills...</div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-900/50 backdrop-blur-2xl rounded-3xl border border-gray-800 shadow-2xl p-16 text-center flex flex-col items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-full mb-6 border border-gray-700 shadow-inner">
            <CheckCircle2 size={64} className="text-gray-600" />
          </div>
          <h3 className="text-3xl font-black text-white mb-2">No pending bills</h3>
          <p className="text-gray-400 font-medium text-lg">All accepted orders have been successfully billed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <div key={order._id} className="bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-800 shadow-2xl hover:bg-gray-800/80 transition-all duration-300 relative overflow-hidden flex flex-col group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>

              <div className="p-6 border-b border-gray-800 flex justify-between items-start bg-gray-900/50">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Table {order.tableNumber}</h3>
                  <p className="text-xs text-gray-500 font-mono font-bold tracking-wider">#{order._id.slice(-6).toUpperCase()}</p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 font-black px-3 py-1.5 rounded-lg text-xs border border-emerald-500/20 uppercase tracking-widest shadow-md">
                  Accepted
                </span>
              </div>

              <div className="p-6 flex-1 bg-gray-900/20">
                <ul className="space-y-4 text-sm">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center bg-gray-800 p-3 rounded-xl border border-gray-700 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-gray-700 border border-gray-600 text-gray-300 font-black flex items-center justify-center text-sm shadow-sm">
                          {item.quantity}
                        </span>
                        <span className="font-medium text-gray-200 text-base">{item.name}</span>
                      </div>
                      <span className="text-white font-black">₹{item.price * item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 bg-gray-900 border-t border-gray-800 flex justify-between items-center rounded-b-3xl mt-auto">
                <div>
                  <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="text-3xl font-black text-white drop-shadow-sm">₹{order.totalCost}</p>
                </div>
                <button
                  onClick={() => finalizeBill(order._id)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 px-6 rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transform hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                  <ReceiptCent size={20} />
                  Bill Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
