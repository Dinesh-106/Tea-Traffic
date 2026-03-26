import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ReceiptCent, CheckCircle2, Clock } from 'lucide-react';

export default function BillingDashboard() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders?status=Accepted');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch accepted orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const finalizeBill = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/orders/${id}/status`, { status: 'Billed' });
      setOrders(orders.filter(o => o._id !== id));
      alert('Order billed successfully and removed from active list.');
    } catch (err) {
      alert('Failed to finalize bill');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-extrabold flex items-center gap-4 text-white drop-shadow-xl tracking-tight">
          <div className="bg-emerald-500/20 backdrop-blur-md p-3 rounded-2xl border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <ReceiptCent className="text-emerald-400" size={32} />
          </div>
          Billing Center
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-200 bg-black/40 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-2xl border border-white/10">
          <Clock size={16} className="text-emerald-400 animate-pulse" /> Auto-updating every 5s
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-32 text-gray-400 text-lg font-medium animate-pulse">Loading active bills...</div>
      ) : orders.length === 0 ? (
        <div className="bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-16 text-center flex flex-col items-center justify-center">
          <div className="bg-white/5 p-6 rounded-full mb-6 border border-white/10">
            <CheckCircle2 size={64} className="text-emerald-400/80" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">No pending bills</h3>
          <p className="text-gray-400 text-lg">All accepted orders have been successfully billed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <div key={order._id} className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl hover:bg-black/50 transition-all duration-300 relative overflow-hidden flex flex-col group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-emerald-400"></div>
              
              <div className="p-6 border-b border-white/10 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Table {order.tableNumber}</h3>
                  <p className="text-xs text-emerald-400/80 font-mono tracking-wider">#{order._id.slice(-6).toUpperCase()}</p>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1.5 rounded-lg text-xs border border-emerald-500/30 uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  Accepted
                </span>
              </div>

              <div className="p-6 flex-1 bg-white/5">
                <ul className="space-y-4 text-sm">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5 shadow-inner">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-sm shadow-sm">
                          {item.quantity}
                        </span>
                        <span className="font-medium text-gray-200 text-base">{item.name}</span>
                      </div>
                      <span className="text-emerald-400 font-bold">₹{item.price * item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 bg-black/60 border-t border-white/10 flex justify-between items-center rounded-b-3xl">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="text-3xl font-extrabold text-white">₹{order.totalCost}</p>
                </div>
                <button
                  onClick={() => finalizeBill(order._id)}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 px-6 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transform hover:-translate-y-1 transition-all flex items-center gap-2"
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
