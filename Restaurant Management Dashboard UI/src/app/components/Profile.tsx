import { useEffect, useMemo, useState } from 'react';
import { User, Mail, Phone, Award, Edit2, Save, Package, Download, RefreshCw, MapPin, Lock, Eye, EyeOff, Heart, HeartOff, Crown, CheckCircle, Zap, LogOut } from 'lucide-react';
import type { User as UserType, Order, CartItem } from '@/app/App';
import type { MenuItem } from '@/app/data/menuData';
import { menuData } from '@/app/data/menuData';
import { fetchMenuItems } from '@/api/menu';
import { MenuItemImage } from '@/app/components/MenuItemImage';
import { useLoyalty } from '@/app/context/LoyaltyContext';

interface ProfileProps {
  user: UserType;
  onUpdateUser: (user: UserType) => Promise<void> | void;
  onLogout: () => void;
  orders?: Order[];
  onReorder?: (items: CartItem[]) => void;
}

export default function Profile({ user, onUpdateUser, onLogout, orders = [], onReorder }: ProfileProps) {
  const loyalty = useLoyalty();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'favorites'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing) setFormData(user);
  }, [isEditing, user]);

  useEffect(() => {
    let cancelled = false;
    fetchMenuItems()
      .then((items) => {
        if (!cancelled) setMenuItems(items);
      })
      .catch(() => {
        if (!cancelled) setMenuItems(menuData);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const currentPoints = loyalty.balancePoints;
  const tier = useMemo(() => loyalty.getTierByPoints(currentPoints), [currentPoints, loyalty]);

  const handleSave = async () => {
    setSaveError(null);
    setIsSaving(true);
    try {
      await onUpdateUser(formData);
      setIsEditing(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save profile.';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>My Profile</h1>
          <p className="text-muted-foreground">Manage your account information and view order history</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
                activeTab === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Information
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Order History
                {orders.length > 0 && (
                  <span className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">
                    {orders.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
                activeTab === 'favorites'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Favorite Dishes
                {user.favorites && user.favorites.length > 0 && (
                  <span className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">
                    {user.favorites.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Profile Tab Content */}
        {activeTab === 'profile' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="md:col-span-2 bg-card rounded-xl border border-border shadow-sm p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Personal Information</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {saveError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {saveError}
                    </div>
                  )}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    ) : (
                      <p className="text-lg text-foreground">{user.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    ) : (
                      <p className="text-lg text-foreground">{user.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    ) : (
                      <p className="text-lg text-foreground">{user.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </label>
                    {isEditing ? (
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-3 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        rows={3}
                        placeholder="Enter your delivery address"
                      />
                    ) : (
                      <p className="text-lg text-foreground">{user.address || 'No address provided'}</p>
                    )}
                  </div>

                  {isEditing && (
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                        <Lock className="w-4 h-4" />
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-3 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          placeholder="Enter new password"
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Leave blank to keep current password</p>
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
                        disabled={isSaving}
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => {
                          setFormData(user);
                          setIsEditing(false);
                        }}
                        className="flex-1 px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Loyalty Points Card */}
              <div className="bg-gradient-to-br from-primary to-accent text-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">Loyalty Points</h3>
                </div>
                <div className="mb-6">
                  <p className="text-5xl font-bold">{currentPoints}</p>
                  <p className="text-white/80 text-sm mt-2">Points Available</p>
                  <div className="mt-4 space-y-1">
                    <p className="text-sm text-white/90">
                      <span className="font-semibold">Tier:</span> {tier}
                    </p>
                    {loyalty.config.autoExpiryEnabled && loyalty.expiringSoonPoints > 0 && (
                      <p className="text-xs text-white/80">
                        {loyalty.expiringSoonPoints} points expiring within 30 days
                      </p>
                    )}
                  </div>
                </div>
                <div className="border-t border-white/20 pt-4">
                  <p className="text-sm text-white/80">
                    Earn points with every order and redeem them for exclusive rewards!
                  </p>
                </div>
              </div>
            </div>

            {/* Membership Status Card */}
            <div className="mt-6">
              {user.membership && user.membership.plan !== 'none' ? (
                <div className="loyalty-card membership-gradient p-6">
                  {/* Decorative elements */}
                  <div className="loyalty-card-decor-1"></div>
                  <div className="loyalty-card-decor-2"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#C8A47A] to-[#8B5A2B] rounded-xl flex items-center justify-center border-2 border-white/20">
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-[#FAF7F2]/60 uppercase tracking-wider font-bold mb-1">Membership Status</p>
                          <h3 className="text-2xl font-black text-[#C8A47A] capitalize" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {user.membership.plan}
                          </h3>
                        </div>
                      </div>

                      <div
                        className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider ${
                          user.membership.status === 'active'
                            ? 'bg-green-500/20 text-green-300 border-2 border-green-500/50'
                            : 'bg-gray-500/20 text-gray-300 border-2 border-gray-500/50'
                        }`}
                      >
                        {user.membership.status === 'active' ? '✓ Active' : user.membership.status}
                      </div>
                    </div>

                    {/* Perks Summary */}
                    <div className="space-y-3 mb-4">
                      <div className="loyalty-panel flex items-center gap-2 p-3">
                        <div className="w-6 h-6 bg-[#C8A47A]/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Zap className="w-4 h-4 text-[#C8A47A]" />
                        </div>
                        <p className="text-[#FAF7F2]/90 text-sm font-medium">+{user.membership.pointsBoost}% loyalty points boost</p>
                      </div>
                      <div className="loyalty-panel flex items-center gap-2 p-3">
                        <div className="w-6 h-6 bg-[#C8A47A]/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-[#C8A47A]" />
                        </div>
                        <p className="text-[#FAF7F2]/90 text-sm font-medium">Exclusive member-only offers</p>
                      </div>
                    </div>

                    {user.membership.expiryDate && (
                      <div className="text-center pt-4 border-t border-[#C8A47A]/20">
                        <p className="text-xs text-[#FAF7F2]/60">
                          Valid until {new Date(user.membership.expiryDate).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-xl border border-border shadow-sm p-6 text-center">
                  <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    No Active Membership
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Unlock exclusive benefits and extra loyalty points
                  </p>
                  <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                    Explore Membership Plans
                  </button>
                </div>
              )}
            </div>

            {/* Account Stats */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card rounded-xl border border-border shadow-sm p-6 text-center">
                <p className="text-3xl font-bold mb-1 text-primary">{orders.length}</p>
                <p className="text-muted-foreground text-sm">Total Orders</p>
              </div>
              <div className="bg-card rounded-xl border border-border shadow-sm p-6 text-center">
                <p className="text-3xl font-bold mb-1 text-primary">
                  ₹{orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                </p>
                <p className="text-muted-foreground text-sm">Total Spent</p>
              </div>
              <div className="bg-card rounded-xl border border-border shadow-sm p-6 text-center">
                <p className="text-3xl font-bold mb-1 text-primary">3</p>
                <p className="text-muted-foreground text-sm">Active Offers</p>
              </div>
            </div>

            {/* Logout Button */}
            <div className="mt-6 text-center">
              <button
                onClick={onLogout}
                className="inline-flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </>
        )}

        {/* Order History Tab Content */}
        {activeTab === 'history' && (
          <>
            {orders.length === 0 ? (
              <div className="bg-card rounded-xl border border-border shadow-sm p-12 text-center">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="text-3xl font-bold mb-2 text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>No Order History</h2>
                <p className="text-muted-foreground">Your past orders will appear here</p>
              </div>
            ) : (
              <>
                {/* Orders List */}
                <div className="space-y-4 mb-6">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
                    >
                      {/* Order Header */}
                      <div className="bg-muted px-6 py-4 border-b border-border">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-lg text-foreground">Order #{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.date).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Total</p>
                              <p className="text-xl font-bold text-primary">₹{order.total.toFixed(2)}</p>
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
                              className="flex justify-between items-center py-2 border-b border-border last:border-0"
                            >
                              <div className="flex-1">
                                <p className="font-semibold text-foreground">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.quantity} × ₹{item.price}
                                  {item.isVeg ? (
                                    <span className="ml-2 text-xs text-green-600">🟢 Veg</span>
                                  ) : (
                                    <span className="ml-2 text-xs text-red-600">🔴 Non-Veg</span>
                                  )}
                                </p>
                              </div>
                              <p className="font-semibold text-foreground">₹{item.price * item.quantity}</p>
                            </div>
                          ))}
                        </div>

                        {/* Order Meta */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="capitalize">Type: {order.type}</span>
                          <span>•</span>
                          <span>{order.items.length} items</span>
                        </div>

                        {/* Delivery Address */}
                        {order.deliveryAddress && (
                          <div className="mb-4 p-4 bg-muted/50 rounded-lg border border-border">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-foreground mb-1">Delivery Address</p>
                                <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => onReorder && onReorder(order.items)}
                            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Reorder
                          </button>
                          <button className="flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg font-medium hover:bg-secondary transition-colors text-foreground">
                            <Download className="w-4 h-4" />
                            Invoice
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Card */}
                <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4 text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Order Statistics</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold mb-1 text-primary">{orders.length}</p>
                      <p className="text-muted-foreground text-sm">Total Orders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold mb-1 text-primary">
                        ₹{orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                      </p>
                      <p className="text-muted-foreground text-sm">Total Spent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold mb-1 text-primary">
                        {orders.reduce((sum, order) => sum + order.items.length, 0)}
                      </p>
                      <p className="text-muted-foreground text-sm">Items Ordered</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Favorites Tab Content */}
        {activeTab === 'favorites' && (
          <>
            {user.favorites && user.favorites.length === 0 ? (
              <div className="bg-card rounded-xl border border-border shadow-sm p-12 text-center">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="text-3xl font-bold mb-2 text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>No Favorite Dishes</h2>
                <p className="text-muted-foreground">You have no favorite dishes yet.</p>
              </div>
            ) : (
              <>
                {/* Favorites List */}
                <div className="space-y-4 mb-6">
                  {user.favorites.map((itemId) => {
                    const item = menuItems.find((menu) => menu.id === itemId);
                    if (!item) return null;
                    return (
                      <div
                        key={item.id}
                        className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
                      >
                        {/* Item Header */}
                        <div className="bg-muted px-6 py-4 border-b border-border">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold text-lg text-foreground">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.category}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Price</p>
                                <p className="text-xl font-bold text-primary">₹{item.price.toFixed(2)}</p>
                              </div>
                              <span
                                className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${
                                  item.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {item.isVeg ? 'Veg' : 'Non-Veg'}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextFavorites = (user.favorites ?? []).filter((id) => id !== item.id);
                                  onUpdateUser({ ...user, favorites: nextFavorites });
                                }}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                                title="Remove from favorites"
                              >
                                <HeartOff className="w-4 h-4" />
                                <span className="text-sm font-medium">Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Item Details */}
                        <div className="px-6 py-4">
                          <div className="flex gap-6">
                            <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <MenuItemImage
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
                                {item.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{item.calories} kcal</span>
                                <span>•</span>
                                <span>{item.prepTime}</span>
                                {item.popular && (
                                  <>
                                    <span>•</span>
                                    <span className="text-primary font-semibold">⭐ Popular</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 px-6 py-4">
                          <button
                            onClick={() => onReorder && onReorder([{ 
                              id: `${item.id}-${Date.now()}`, 
                              name: item.name, 
                              price: item.price, 
                              image: item.image, 
                              quantity: 1, 
                              isVeg: item.isVeg 
                            }])}
                            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}