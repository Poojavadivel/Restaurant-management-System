import { Download, RefreshCw, Package } from 'lucide-react';
import type { Order, CartItem } from '@/app/App';

interface OrderHistoryProps {
  orders: Order[];
  onReorder: (items: CartItem[]) => void;
}

export default function OrderHistory({ orders, onReorder }: OrderHistoryProps) {
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold mb-2">No Order History</h2>
          <p className="text-gray-600">Your past orders will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Order History</h1>
          <p className="text-gray-600">{orders.length} past orders</p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-lg">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.date).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-xl font-bold">₹{order.total.toFixed(2)}</p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${
                        order.status === 'served' || order.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'ready'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <div className="space-y-3 mb-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × ₹{item.price}
                          {item.isVeg ? (
                            <span className="ml-2 text-xs text-green-600">🟢 Veg</span>
                          ) : (
                            <span className="ml-2 text-xs text-red-600">🔴 Non-Veg</span>
                          )}
                        </p>
                      </div>
                      <p className="font-semibold">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                {/* Order Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="capitalize">Type: {order.type}</span>
                  <span>•</span>
                  <span>{order.items.length} items</span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => onReorder(order.items)}
                    className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reorder
                  </button>
                  <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4" />
                    Invoice
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Order Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">{orders.length}</p>
              <p className="text-gray-600 text-sm">Total Orders</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">
                ₹{orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
              </p>
              <p className="text-gray-600 text-sm">Total Spent</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">
                {orders.reduce((sum, order) => sum + order.items.length, 0)}
              </p>
              <p className="text-gray-600 text-sm">Items Ordered</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
