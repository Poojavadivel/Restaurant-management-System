import { useEffect, useMemo, useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, Smartphone, Wallet, CheckCircle, Download, Award } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import type { CartItem, Order, User } from '@/app/App';
import { useLoyalty } from '@/app/context/LoyaltyContext';
import type { Offer } from '@/app/data/offersData';
import { getEligibleOffers } from '@/app/data/offersData';
import { fetchEligibleOffers } from '@/api/offers';

interface CartProps {
  cart: CartItem[];
  user?: User;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: (order: Order) => void;
}

export default function Cart({ cart, user, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) {
  const loyalty = useLoyalty();
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<'upi' | 'card' | 'cash' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState<string | null>(null);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [loyaltyPointsToUse, setLoyaltyPointsToUse] = useState(0);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const [appliedOfferId, setAppliedOfferId] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [eligibleOffers, setEligibleOffers] = useState<Offer[]>([]);

  useEffect(() => {
    let cancelled = false;
    const loyaltyPoints = user ? loyalty.balancePoints : 0;
    fetchEligibleOffers({ subtotal, loyaltyPoints })
      .then((offers) => {
        if (!cancelled) setEligibleOffers(offers);
      })
      .catch(() => {
        if (!cancelled) setEligibleOffers(getEligibleOffers(subtotal, loyaltyPoints));
      });
    return () => {
      cancelled = true;
    };
  }, [loyalty.balancePoints, subtotal, user]);

  const appliedOffer: Offer | null = useMemo(() => {
    if (!appliedOfferId) return null;
    return eligibleOffers.find((o) => o.id === appliedOfferId) ?? null;
  }, [appliedOfferId, eligibleOffers]);

  useEffect(() => {
    if (appliedOfferId && !appliedOffer) {
      setAppliedOfferId(null);
    }
  }, [appliedOffer, appliedOfferId]);

  const offerDiscount = useMemo(() => {
    if (!appliedOffer) return 0;
    if (subtotal <= 0) return 0;

    const computed =
      appliedOffer.type === 'PERCENT'
        ? Math.floor((subtotal * appliedOffer.value) / 100)
        : appliedOffer.value;

    return Math.min(subtotal, Math.max(0, computed));
  }, [appliedOffer, subtotal]);

  const subtotalAfterOffer = Math.max(0, subtotal - offerDiscount);

  const loyaltyDiscount = useMemo(() => {
    if (!loyalty.config.loyaltyEnabled) return 0;
    if (!useLoyaltyPoints) return 0;
    if (!user) return 0;
    if (!loyalty.canRedeem) return 0;
    if (loyaltyPointsToUse < loyalty.config.minRedeemablePoints) return 0;
    if (loyaltyPointsToUse > loyalty.maxRedeemablePoints) return 0;

    const discount = loyalty.pointsToRupeeDiscount(loyaltyPointsToUse);
    return Math.min(subtotalAfterOffer, Math.max(0, discount));
  }, [loyalty, loyaltyPointsToUse, subtotalAfterOffer, useLoyaltyPoints, user]);

  const discountedSubtotal = Math.max(0, subtotalAfterOffer - loyaltyDiscount);
  const tax = discountedSubtotal * 0.05; // 5% GST (applied after loyalty discount)
  const total = discountedSubtotal + tax;

  const handlePayment = () => {
    if (!orderType || !selectedPayment) return;
    if (selectedPayment === 'upi' && !upiId.trim()) {
      setUpiError('UPI ID is required.');
      return;
    }

    const orderId = pendingOrderId ?? `ORD-${Date.now()}`;
    setPendingOrderId(orderId);

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);

      if (useLoyaltyPoints && loyaltyDiscount > 0) {
        loyalty.redeemPoints({ orderId, points: loyaltyPointsToUse });
      }

      const earned = loyalty.earnForPayment({
        orderId,
        subtotal: discountedSubtotal,
        date: new Date().toISOString(),
      });
      setEarnedPoints(earned.pointsAwarded);
      
      const order: Order = {
        id: orderId,
        items: cart,
        subtotal: discountedSubtotal,
        tax,
        loyaltyDiscount,
        loyaltyPointsRedeemed: useLoyaltyPoints ? loyaltyPointsToUse : 0,
        total,
        status: 'preparing',
        type: orderType,
        date: new Date().toISOString(),
        deliveryAddress: user?.address || ''
      };
      
      setTimeout(() => {
        onCheckout(order);
      }, 2000);
    }, 2000);
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
        <div className="max-w-lg w-full bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your payment of ₹{total.toFixed(2)} has been received
            </p>
            {loyalty.config.loyaltyEnabled && earnedPoints > 0 && (
              <p className="text-gray-600 mb-4">
                🎉 You earned {earnedPoints} loyalty points for this order!
              </p>
            )}
            <div className="animate-pulse text-gray-500 text-sm">
              Redirecting to order tracking...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Add items from the menu to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Shopping Cart & Checkout</h1>
          <p className="text-muted-foreground">{cart.length} items in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items List */}
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                >
                  <div className="flex gap-4">
                    {/* Item Image */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <ImageWithFallback
                        src={`https://source.unsplash.com/featured/400x300/?${encodeURIComponent(item.image)}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                              item.isVeg
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                          </span>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>

                      {/* Customizations */}
                      {(item.spiceLevel || item.addons?.length || item.specialInstructions) && (
                        <div className="mb-3 text-sm text-gray-600 space-y-1">
                          {item.spiceLevel && (
                            <p>
                              <span className="font-medium">Spice:</span> {item.spiceLevel}
                            </p>
                          )}
                          {item.addons && item.addons.length > 0 && (
                            <p>
                              <span className="font-medium">Add-ons:</span>{' '}
                              {item.addons.join(', ')}
                            </p>
                          )}
                          {item.specialInstructions && (
                            <p>
                              <span className="font-medium">Note:</span>{' '}
                              {item.specialInstructions}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-semibold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">₹{item.price} each</p>
                          <p className="text-xl font-bold">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Type Selection */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Select Order Type</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setOrderType('dine-in')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    orderType === 'dine-in'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <p className="font-semibold">Dine-In</p>
                  <p className="text-sm text-gray-600 mt-1">Eat at restaurant</p>
                </button>
                <button
                  onClick={() => setOrderType('takeaway')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    orderType === 'takeaway'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <p className="font-semibold">Takeaway</p>
                  <p className="text-sm text-gray-600 mt-1">Pick up later</p>
                </button>
              </div>
            </div>

            {/* Payment Method Selection */}
            {orderType && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {/* UPI */}
                  <button
                    onClick={() => setSelectedPayment('upi')}
                    className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg transition-colors ${
                      selectedPayment === 'upi'
                        ? 'border-black bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">UPI Payment</p>
                      <p className="text-sm text-gray-600">Google Pay, PhonePe, Paytm</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPayment === 'upi'
                          ? 'border-black bg-black'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedPayment === 'upi' && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </button>

                  {/* Card */}
                  <button
                    onClick={() => setSelectedPayment('card')}
                    className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg transition-colors ${
                      selectedPayment === 'card'
                        ? 'border-black bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">Credit/Debit Card</p>
                      <p className="text-sm text-gray-600">Visa, Mastercard, Rupay</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPayment === 'card'
                          ? 'border-black bg-black'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedPayment === 'card' && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </button>

                  {/* Cash */}
                  <button
                    onClick={() => setSelectedPayment('cash')}
                    className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg transition-colors ${
                      selectedPayment === 'cash'
                        ? 'border-black bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">Cash Payment</p>
                      <p className="text-sm text-gray-600">Pay at restaurant/pickup</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPayment === 'cash'
                          ? 'border-black bg-black'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedPayment === 'cash' && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </button>
                </div>

                {/* Payment Details Form (shown for card or UPI) */}
                {selectedPayment === 'card' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold mb-4">Card Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">CVV</label>
                          <input
                            type="text"
                            placeholder="123"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPayment === 'upi' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold mb-4">UPI ID</h3>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => {
                        setUpiId(e.target.value);
                        if (upiError) setUpiError(null);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    />
                    {upiError && (
                      <p className="mt-2 text-sm text-red-600">{upiError}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Billing Summary - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="loyalty-card membership-gradient p-6 sticky top-24">
              <div className="loyalty-card-decor-1"></div>
              <div className="loyalty-card-decor-2"></div>

              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-6 text-[#FAF7F2]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Bill Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[#FAF7F2]/80">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#FAF7F2]">₹{subtotal.toFixed(2)}</span>
                  </div>

                  {/* Eligible Offers */}
                  {eligibleOffers.length > 0 && (
                    <div className="loyalty-panel p-3">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="text-sm font-bold text-[#FAF7F2]">Eligible Offers</p>
                        <span className="loyalty-badge">Offers</span>
                      </div>
                      <div className="space-y-2">
                        {eligibleOffers.map((offer) => {
                          const isApplied = appliedOfferId === offer.id;
                          const disabled = !!appliedOfferId && !isApplied;
                          return (
                            <div
                              key={offer.id}
                              className={isApplied ? 'loyalty-row loyalty-row-applied' : 'loyalty-row'}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-semibold text-[#FAF7F2]/90 truncate">{offer.title}</p>
                                  {isApplied && <span className="loyalty-badge-solid">Applied</span>}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setAppliedOfferId((prev) => (prev === offer.id ? null : offer.id))}
                                disabled={disabled}
                                className={`${isApplied ? 'loyalty-badge-solid' : 'loyalty-badge'} transition-all ${
                                  disabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'
                                }`}
                              >
                                {isApplied ? 'Remove' : 'Apply'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {offerDiscount > 0 && (
                    <div className="flex justify-between text-[#FAF7F2]/80">
                      <span>Offer Discount</span>
                      <span className="font-semibold text-[#C8A47A]">-₹{offerDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Loyalty Points Redemption */}
                  <div className="loyalty-panel p-3">
                    <div className="flex items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-[#FAF7F2] select-none">
                        <input
                          type="checkbox"
                          checked={useLoyaltyPoints}
                          onChange={(e) => {
                            const next = e.target.checked;
                            setUseLoyaltyPoints(next);
                            if (!next) setLoyaltyPointsToUse(0);
                            if (next && loyaltyPointsToUse < loyalty.config.minRedeemablePoints) {
                              setLoyaltyPointsToUse(loyalty.config.minRedeemablePoints);
                            }
                          }}
                          disabled={!user || !loyalty.config.loyaltyEnabled || !loyalty.canRedeem}
                          className="loyalty-checkbox"
                        />
                        <Award className="w-4 h-4 text-[#C8A47A]" />
                        Use Loyalty Points
                      </label>

                      <div className="text-right">
                        <p className="text-xs text-[#FAF7F2]/70">Available</p>
                        <span className="loyalty-badge mt-1">{user ? loyalty.balancePoints : 0} pts</span>
                      </div>
                    </div>

                    {!loyalty.config.loyaltyEnabled && (
                      <p className="text-xs text-[#FAF7F2]/70 mt-2">Loyalty program is currently disabled.</p>
                    )}
                    {loyalty.config.loyaltyEnabled && user && !loyalty.canRedeem && (
                      <p className="text-xs text-[#FAF7F2]/70 mt-2">
                        Minimum {loyalty.config.minRedeemablePoints} points required to redeem.
                      </p>
                    )}

                    {useLoyaltyPoints && user && loyalty.config.loyaltyEnabled && loyalty.canRedeem && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-[#FAF7F2]/75 mb-2">
                          <span>Select points to use</span>
                          <span>
                            {loyaltyPointsToUse} pts (₹{Math.min(subtotalAfterOffer, loyalty.pointsToRupeeDiscount(loyaltyPointsToUse)).toFixed(0)} off)
                          </span>
                        </div>
                        <input
                          type="range"
                          min={loyalty.config.minRedeemablePoints}
                          max={loyalty.maxRedeemablePoints}
                          step={loyalty.config.pointsPerRupeeDiscount}
                          value={Math.min(loyaltyPointsToUse, loyalty.maxRedeemablePoints)}
                          onChange={(e) => setLoyaltyPointsToUse(Number(e.target.value))}
                          className="w-full accent-[#C8A47A]"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-[#FAF7F2]/60">{loyalty.config.minRedeemablePoints} pts</span>
                          <span className="text-xs text-[#FAF7F2]/60">{loyalty.maxRedeemablePoints} pts</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-[#FAF7F2]/80">
                      <span>Loyalty Discount</span>
                      <span className="font-semibold text-[#C8A47A]">-₹{loyaltyDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#FAF7F2]/80">
                    <span>GST (5%)</span>
                    <span className="font-semibold text-[#FAF7F2]">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-[#C8A47A]/20">
                    <div className="flex justify-between items-end">
                      <span className="text-lg font-semibold text-[#FAF7F2]">Total Amount</span>
                      <span className="text-3xl font-black text-[#C8A47A]">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {orderType && (
                  <div className="mb-4 p-3 loyalty-panel">
                    <p className="text-sm text-[#FAF7F2]/70">Order Type</p>
                    <p className="font-semibold text-[#FAF7F2] capitalize">{orderType.replace('-', ' ')}</p>
                  </div>
                )}

                {selectedPayment && (
                  <div className="mb-6 p-3 loyalty-panel">
                    <p className="text-sm text-[#FAF7F2]/70">Payment Method</p>
                    <p className="font-semibold text-[#FAF7F2] capitalize">{selectedPayment === 'upi' ? 'UPI' : selectedPayment}</p>
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={
                    !orderType ||
                    !selectedPayment ||
                    isProcessing ||
                    (selectedPayment === 'upi' && !upiId.trim())
                  }
                  className="w-full bg-[#C8A47A] text-[#2D1B10] py-3 rounded-lg font-semibold hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed mb-3"
                >
                  {isProcessing ? 'Processing...' : `Complete Payment - ₹${total.toFixed(2)}`}
                </button>

                <button className="w-full flex items-center justify-center gap-2 text-[#FAF7F2]/80 py-2 text-sm hover:text-[#FAF7F2]">
                  <Download className="w-4 h-4" />
                  Download Invoice
                </button>

                <div className="mt-6 p-4 loyalty-panel">
                  <p className="text-sm text-[#FAF7F2]/85">
                    <span className="loyalty-badge-solid mr-2">Free Delivery</span>
                    on orders above ₹500
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}