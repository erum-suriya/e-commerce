import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const STATUS_COLORS = {
  processing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my')
      .then(res => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading orders...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl font-semibold mb-10">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-4">You haven't placed any orders yet.</p>
          <Link to="/shop" className="btn-primary inline-block">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white border border-gray-100 p-6 card-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 border rounded-full capitalize ${STATUS_COLORS[order.orderStatus]}`}>
                  {order.orderStatus}
                </span>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex-shrink-0 w-16">
                    <div className="w-16 h-20 bg-gray-100 overflow-hidden">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">{item.name}</p>
                    <p className="text-xs font-medium">×{item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <div>
                  <p className="text-sm text-gray-500">
                    {order.shippingAddress.city}, {order.shippingAddress.country}
                  </p>
                  <p className="text-xs text-gray-400">{order.paymentMethod}</p>
                </div>
                <p className="font-display text-xl font-bold">${order.totalPrice.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}