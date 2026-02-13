import { useState, useEffect } from 'react';
import { CheckCircle, Clock, ChefHat, CheckCheck } from 'lucide-react';
import type { Order } from '@/app/App';
import { useLoyalty } from '@/app/context/LoyaltyContext';

interface OrderTrackingProps {
  order: Order | null;
}

export default function OrderTracking({ order }: OrderTrackingProps) {
  const loyalty = useLoyalty();
  const [currentStatus, setCurrentStatus] = useState<Order['status']>(order?.status || 'preparing');

  // Guard: If no order exists, show a message
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
        <div className="max-w-lg w-full bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">No Order Found</h2>
          <p className="text-gray-600 mb-6">
            Please place an order from the menu first.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Simulate status progression
    const statuses: Order['status'][] = ['preparing', 'ready', 'served'];
    let currentIndex = statuses.indexOf(currentStatus);

    const interval = setInterval(() => {
      if (currentIndex < statuses.length - 1) {
        currentIndex++;
        setCurrentStatus(statuses[currentIndex]);
      }
    }, 8000); // Progress every 8 seconds for demo

    return () => clearInterval(interval);
  }, [currentStatus]);

  useEffect(() => {
    if (!order) return;
    if (currentStatus !== 'served' && currentStatus !== 'completed') return;

    const itemsSubtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const effectiveSubtotal =
      typeof order.subtotal === 'number'
        ? order.subtotal
        : Math.max(0, itemsSubtotal - (order.loyaltyDiscount ?? 0));

    loyalty.earnForPayment({
      orderId: order.id,
      subtotal: effectiveSubtotal,
      date: new Date().toISOString(),
    });
  }, [currentStatus, loyalty, order]);

  const steps = [
    {
      id: 'preparing',
      label: 'Preparing',
      icon: ChefHat,
      description: 'Your order is being prepared by our chefs'
    },
    {
      id: 'ready',
      label: 'Ready',
      icon: CheckCheck,
      description: 'Your order is ready for pickup/serving'
    },
    {
      id: 'served',
      label: 'Served',
      icon: CheckCircle,
      description: 'Order completed - Enjoy your meal!'
    }
  ];

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex((s) => s.id === stepId);
    const currentIndex = steps.findIndex((s) => s.id === currentStatus);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Track Your Order</h1>
          <p className="text-gray-600">Order #{order.id}</p>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Order Type</p>
              <p className="font-semibold capitalize">{order.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Order Time</p>
              <p className="font-semibold">
                {new Date(order.date).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="font-semibold">₹{order.total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-xl font-bold mb-8">Order Status</h2>

          <div className="space-y-8">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              const Icon = step.icon;

              return (
                <div key={step.id} className="relative">
                  <div className="flex items-start gap-4">
                    {/* Icon Circle */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        status === 'completed'
                          ? 'bg-green-600'
                          : status === 'active'
                          ? 'bg-black'
                          : 'bg-gray-300'
                      }`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : status === 'active' ? (
                        <Icon className="w-6 h-6 text-white" />
                      ) : (
                        <Clock className="w-6 h-6 text-gray-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <h3
                        className={`text-lg font-semibold mb-1 ${
                          status === 'pending' ? 'text-gray-400' : 'text-black'
                        }`}
                      >
                        {step.label}
                      </h3>
                      <p
                        className={`text-sm ${
                          status === 'pending' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {step.description}
                      </p>
                      {status === 'active' && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                          <span className="text-sm font-semibold text-black">In Progress</span>
                        </div>
                      )}
                      {status === 'completed' && (
                        <div className="mt-3">
                          <span className="text-sm text-green-600 font-semibold">Completed</span>
                        </div>
                      )}
                    </div>

                    {/* Time Estimate */}
                    <div className="text-right">
                      {status === 'active' && (
                        <span className="text-sm text-gray-600">~5 mins</span>
                      )}
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`absolute left-6 top-12 w-0.5 h-8 -ml-px ${
                        status === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Need Help?</span> Contact our support team or call the
            restaurant at +91-XXXXX-XXXXX
          </p>
        </div>
      </div>
    </div>
  );
}