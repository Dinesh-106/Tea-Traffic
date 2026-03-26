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
        <h2 className="text-3xl font-extrabold flex items-center gap-4 text-gray-900 tracking-tight drop-shadow-sm">
          <div className="bg-yellow-400 p-3 rounded-2xl border border-yellow-500 shadow-sm">
            <ReceiptCent className="text-yellow-900" size={32} />
          </div>
          Billing Center
        </h2>
        <div className="flex items-center gap-2 text-sm text-yellow-900 bg-yellow-400/90 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-md border border-yellow-500">
          <Clock size={16} className="text-yellow-800 animate-pulse" /> Auto-updating every 3s
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-32 text-yellow-500 font-bold animate-pulse text-xl drop-shadow-lg">Loading active bills...</div>
      ) : orders.length === 0 ? (
        <div className="bg-yellow-400/95 backdrop-blur-2xl rounded-3xl border border-yellow-500 shadow-2xl p-16 text-center flex flex-col items-center justify-center">
          <div className="bg-yellow-300 p-6 rounded-full mb-6 border border-yellow-400 shadow-inner">
            <CheckCircle2 size={64} className="text-yellow-700/50" />
          </div>
          <h3 className="text-3xl font-black text-yellow-900 mb-2">No pending bills</h3>
          <p className="text-yellow-800 font-medium text-lg">All accepted orders have been successfully billed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <div key={order._id} className="bg-yellow-50/95 backdrop-blur-xl rounded-3xl border border-yellow-300 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col group">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>

              <div className="p-6 border-b border-yellow-200 flex justify-between items-start bg-yellow-100/50">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Table {order.tableNumber}</h3>
                  <p className="text-xs text-yellow-600 font-mono font-bold tracking-wider">#{order._id.slice(-6).toUpperCase()}</p>
                </div>
                <span className="bg-emerald-400 text-white font-black px-3 py-1.5 rounded-lg text-xs border border-emerald-500 uppercase tracking-widest shadow-md">
                  Accepted
                </span>
              </div>

              <div className="p-6 flex-1 bg-white/80">
                <ul className="space-y-4 text-sm">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center bg-yellow-50 p-3 rounded-xl border border-yellow-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-yellow-200 border border-yellow-300 text-yellow-900 font-black flex items-center justify-center text-sm shadow-sm">
                          {item.quantity}
                        </span>
                        <span className="font-bold text-gray-900 text-base">{item.name}</span>
                      </div>
                      <span className="text-gray-900 font-black">₹{item.price * item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 bg-yellow-100/80 border-t border-yellow-200 flex justify-between items-center rounded-b-3xl mt-auto">
                <div>
                  <p className="text-xs text-yellow-700 font-black uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="text-3xl font-black text-gray-900 drop-shadow-sm">₹{order.totalCost}</p>
                </div>
                <button
                  onClick={() => finalizeBill(order._id)}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 border border-emerald-600 hover:from-emerald-400 hover:to-emerald-300 text-white font-black py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center gap-2"
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
