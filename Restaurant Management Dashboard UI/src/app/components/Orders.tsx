import { CheckCircle, ArrowRight } from 'lucide-react';
import type { Order, Module } from '@/app/App';

interface OrdersProps {
  currentOrder: Order | null;
  onNavigate: (module: Module) => void;
}

export default function Orders({ currentOrder, onNavigate }: OrdersProps) {
  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold mb-2">No Active Orders</h2>
          <p className="text-gray-600 mb-6">You don't have any active orders at the moment</p>
          <button
            onClick={() => onNavigate('menu')}
            className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-4">
              Your order has been received and is being prepared
            </p>
            <div className="inline-block bg-black text-white px-6 py-2 rounded-full font-semibold text-lg">
              Order #{currentOrder.id}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Order Details</h2>
          
          <div className="space-y-4 mb-6">
            {currentOrder.items.map((item, index) => (
              <div key={index} className="flex justify-between items-start pb-4 border-b border-gray-200 last:border-0">
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity} × ₹{item.price}
                  </p>
                  {item.spiceLevel && (
                    <p className="text-sm text-gray-600">Spice: {item.spiceLevel}</p>
                  )}
                </div>
                <p className="font-semibold">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Type</span>
              <span className="font-semibold capitalize">{currentOrder.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span className="font-semibold">
                {new Date(currentOrder.date).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total Amount</span>
              <span className="font-bold">₹{currentOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">What's Next?</h2>
          
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('tracking')}
              className="w-full flex items-center justify-between p-4 border-2 border-black rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div>
                <p className="font-semibold">Complete Payment</p>
                <p className="text-sm text-gray-600">Choose your payment method</p>
              </div>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => onNavigate('tracking')}
              className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div>
                <p className="font-semibold">Track Order</p>
                <p className="text-sm text-gray-600">See real-time status updates</p>
              </div>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
