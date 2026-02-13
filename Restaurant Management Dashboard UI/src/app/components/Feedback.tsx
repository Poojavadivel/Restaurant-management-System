import { useMemo, useState } from 'react';
import { Star, Send, CheckCircle, Gift } from 'lucide-react';
import type { Order, User } from '@/app/App';
import { submitFeedback } from '@/api/feedback';
import { useLoyalty } from '@/app/context/LoyaltyContext';

interface FeedbackProps {
  user: User;
  orders: Order[];
  onSubmitFeedback?: () => void;
}

export default function Feedback({ user, orders, onSubmitFeedback }: FeedbackProps) {
  const loyalty = useLoyalty();
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [foodRatings, setFoodRatings] = useState<Record<string, number>>({});
  const [hoveredFoodRatings, setHoveredFoodRatings] = useState<Record<string, number>>({});
  const [likedAspects, setLikedAspects] = useState<string[]>([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const selectedOrderObj = useMemo(() => {
    return orders.find((o) => o.id === selectedOrder) ?? null;
  }, [orders, selectedOrder]);

  const orderItems = useMemo(() => {
    return selectedOrderObj?.items ?? [];
  }, [selectedOrderObj]);

  const alreadyReviewed = useMemo(() => {
    if (!selectedOrder) return false;
    return loyalty.reviewedOrders.includes(selectedOrder);
  }, [loyalty.reviewedOrders, selectedOrder]);

  const toggleLikedAspect = (category: string) => {
    setLikedAspects((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const setFoodRating = (itemId: string, value: number) => {
    setFoodRatings((prev) => ({ ...prev, [itemId]: value }));
  };

  const validate = () => {
    if (!selectedOrder) return 'Please select an order to review.';
    if (alreadyReviewed) return 'You have already submitted feedback for this order.';
    if (orderItems.length === 0) return 'Selected order has no items.';
    const missing = orderItems.find((item) => {
      const r = foodRatings[item.id];
      return typeof r !== 'number' || r < 1 || r > 5;
    });
    if (missing) return 'Please rate every food item (1–5 stars).';
    if (likedAspects.length === 0) return 'Please select at least one option under “What did you like?”.';
    if (feedbackText.length > 500) return 'Comment is too long (max 500 characters).';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validate();
    setFormError(error);
    if (error) return;

    const result = loyalty.submitFeedback({
      orderId: selectedOrder,
      foodRatings,
      likedAspects,
      comment: feedbackText.trim() ? feedbackText.trim() : undefined,
    });

    try {
      await submitFeedback({
        userId: user.email,
        orderId: selectedOrder,
        foodRatings,
        likedAspects,
        comment: feedbackText.trim() ? feedbackText.trim() : undefined,
      });
    } catch {
      // Keep UI responsive even if backend write fails.
    }

    // Optional legacy callback (should not mutate loyalty points directly)
    if (onSubmitFeedback) onSubmitFeedback();

    if (loyalty.config.loyaltyEnabled && result.pointsAwarded === 10) {
      setSuccessMessage('Thanks for your feedback! You earned 10 loyalty points 🎉');
    } else {
      setSuccessMessage('Thanks for your feedback!');
    }

    setIsSubmitted(true);
    
    setTimeout(() => {
      setIsSubmitted(false);
      setSelectedOrder('');
      setFoodRatings({});
      setHoveredFoodRatings({});
      setLikedAspects([]);
      setFeedbackText('');
      setFormError('');
      setSuccessMessage('');
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-6">
        <div className="max-w-lg w-full bg-card rounded-xl border border-border shadow-sm p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Thank You!</h2>
            <p className="text-muted-foreground mb-4">Your feedback has been submitted successfully</p>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Gift className="w-5 h-5" />
                <p className="font-semibold">{successMessage || 'Thanks for your feedback!'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Share Your Feedback</h1>
          <p className="text-muted-foreground">Help us improve your dining experience</p>
        </div>

        {/* Loyalty Points Reward Banner */}
        <div className="bg-gradient-to-r from-primary to-accent text-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Earn Rewards for Your Feedback!</h3>
              <p className="text-white/90 text-sm">Get 10 loyalty points when you share your dining experience with us</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select Order */}
            <div>
              <label className="block font-semibold mb-3 text-foreground">Select Order</label>
              <select
                value={selectedOrder}
                onChange={(e) => {
                  const next = e.target.value;
                  setSelectedOrder(next);
                  setFoodRatings({});
                  setHoveredFoodRatings({});
                  setLikedAspects([]);
                  setFeedbackText('');
                  setFormError('');
                }}
                className="w-full px-4 py-3 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              >
                <option value="">Choose an order to review</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    Order #{order.id} - {new Date(order.date).toLocaleDateString('en-IN')} - ₹
                    {order.total.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {selectedOrder && alreadyReviewed && (
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                <p className="text-sm text-foreground font-medium">
                  You have already submitted feedback for this order.
                </p>
              </div>
            )}

            {/* Rating */}
            <div>
              <label className="block font-semibold mb-3 text-foreground">Rate Your Food Items</label>
              <div className="space-y-4">
                {orderItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Select an order to rate items.</p>
                ) : (
                  orderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => !alreadyReviewed && setFoodRating(item.id, star)}
                            onMouseEnter={() =>
                              !alreadyReviewed &&
                              setHoveredFoodRatings((prev) => ({ ...prev, [item.id]: star }))
                            }
                            onMouseLeave={() =>
                              !alreadyReviewed &&
                              setHoveredFoodRatings((prev) => ({ ...prev, [item.id]: 0 }))
                            }
                            className="transition-transform hover:scale-110"
                            disabled={alreadyReviewed}
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= ((hoveredFoodRatings[item.id] || 0) || foodRatings[item.id] || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-border'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Feedback Categories */}
            <div>
              <label className="block font-semibold mb-3 text-foreground">What did you like?</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  'Food Quality',
                  'Service',
                  'Ambience',
                  'Value for Money',
                  'Cleanliness',
                  'Speed'
                ].map((category) => (
                  (() => {
                    const selected = likedAspects.includes(category);
                    return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => !alreadyReviewed && toggleLikedAspect(category)}
                    disabled={alreadyReviewed}
                    aria-pressed={selected}
                    className={`px-4 py-2 border border-border rounded-lg hover:border-primary hover:bg-secondary transition-colors text-sm text-foreground ${
                      selected ? 'border-primary bg-secondary' : ''
                    }`}
                  >
                    {category}
                  </button>
                    );
                  })()
                ))}
              </div>
            </div>

            {/* Feedback Text */}
            <div>
              <label className="block font-semibold mb-3 text-foreground">
                Tell us more about your experience
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full px-4 py-3 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                rows={6}
                placeholder="Share your thoughts, suggestions, or compliments..."
                disabled={alreadyReviewed}
              />
              <p className="text-sm text-muted-foreground mt-2">
                {feedbackText.length} / 500 characters
              </p>
            </div>

            {formError && (
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                <p className="text-sm text-foreground font-medium">{formError}</p>
              </div>
            )}

            {/* Submit Button */}
            {!alreadyReviewed && (
              <button
                type="submit"
                disabled={!selectedOrder || likedAspects.length === 0 || feedbackText.length > 500}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                Submit Feedback & Earn 10 Points
              </button>
            )}
          </form>
        </div>

        {/* Recent Feedback */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 mt-6">
          <h2 className="text-xl font-bold mb-4 text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Your Recent Reviews</h2>
          <div className="space-y-4">
            {loyalty.feedbackHistory.slice(0, 5).map((review) => {
              const ratings = Object.values(review.foodRatings || {});
              const avg = ratings.length > 0 ? Math.round(ratings.reduce((s, r) => s + r, 0) / ratings.length) : 0;

              return (
              <div key={review.id} className="border-b border-border pb-4 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground">Order #{review.orderId}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(review.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= avg
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-border'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {review.comment?.trim()
                    ? review.comment
                    : review.likedAspects.length > 0
                      ? `Liked: ${review.likedAspects.join(', ')}`
                      : '—'}
                </p>
              </div>
              );
            })}

            {loyalty.feedbackHistory.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No reviews yet. Complete an order to leave feedback!
              </p>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mt-6">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Your feedback matters!</span> We read every review and
            use your suggestions to improve our service.
          </p>
        </div>
      </div>
    </div>
  );
}
