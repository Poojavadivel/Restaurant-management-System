import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder, fetchOrders } from '@/api/orders';
import { updateUserProfile } from '@/api/auth';
import TopDashboard from '@/app/components/TopDashboard';
import Home from '@/app/components/Home';
import MenuPreview from '@/app/components/MenuPreview';
import LoginRegister from '@/app/components/LoginRegister';
import Profile from '@/app/components/Profile';
import Reservation from '@/app/components/Reservation';
import Queue from '@/app/components/Queue';
import Menu from '@/app/components/Menu';
import Cart from '@/app/components/Cart';
import Orders from '@/app/components/Orders';
import Settings from '@/app/components/Settings';
import OffersLoyalty from '@/app/components/OffersLoyalty';
import OrderTracking from '@/app/components/OrderTracking';
import OrderHistory from '@/app/components/OrderHistory';
import Feedback from '@/app/components/Feedback';
import NotificationsPage from '@/pages/Notifications';

export type Module = 'home' | 'login' | 'profile' | 'reservation' | 'queue' | 
  'menu' | 'cart' | 'orders' | 'offers' | 'tracking' | 'history' | 'feedback' | 'settings' | 'notifications';

export interface User {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  loyaltyPoints: number;
  favorites: string[]; // Array of menu item IDs
  membership?: {
    plan: 'none' | 'silver' | 'gold' | 'platinum';
    status: 'active' | 'inactive' | 'expired';
    monthlyPrice: number;
    pointsBoost: number; // percentage boost (e.g., 25 for 25%)
    benefits: string[];
    expiryDate?: string;
  };
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  isVeg: boolean;
  spiceLevel?: string;
  addons?: string[];
  specialInstructions?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal?: number;
  tax?: number;
  loyaltyDiscount?: number;
  loyaltyPointsRedeemed?: number;
  total: number;
  status: 'preparing' | 'ready' | 'served' | 'completed';
  type: 'dine-in' | 'takeaway';
  date: string;
  deliveryAddress?: string;
  invoiceUrl?: string;
}

export interface AppState {
  isLoggedIn: boolean;
  user: User | null;
  cart: CartItem[];
  orders: Order[];
  currentOrder: Order | null;
  queueNumber: number | null;
  notifications: Array<{ id: string; message: string; time: string; read: boolean }>;
}

type AppRoute =
  | '/'
  | '/dashboard'
  | '/orders'
  | '/offers'
  | '/loyalty'
  | '/profile'
  | '/menu'
  | '/cart'
  | '/reservation'
  | '/queue'
  | '/tracking'
  | '/history'
  | '/feedback'
  | '/settings'
  | '/notifications'
  | '/login';

function normalizePathname(pathname: string): AppRoute | null {
  const clean = pathname.split('?')[0].split('#')[0];
  const known: AppRoute[] = [
    '/',
    '/dashboard',
    '/orders',
    '/offers',
    '/loyalty',
    '/profile',
    '/menu',
    '/cart',
    '/reservation',
    '/queue',
    '/tracking',
    '/history',
    '/feedback',
    '/settings',
    '/notifications',
    '/login',
  ];

  return (known as string[]).includes(clean) ? (clean as AppRoute) : null;
}

function moduleFromPath(pathname: string): Module {
  const normalized = normalizePathname(pathname);
  switch (normalized) {
    case '/orders':
      return 'orders';
    case '/offers':
    case '/loyalty':
      return 'offers';
    case '/profile':
      return 'profile';
    case '/menu':
      return 'menu';
    case '/cart':
      return 'cart';
    case '/reservation':
      return 'reservation';
    case '/queue':
      return 'queue';
    case '/tracking':
      return 'tracking';
    case '/history':
      return 'history';
    case '/feedback':
      return 'feedback';
    case '/settings':
      return 'settings';
    case '/notifications':
      return 'notifications';
    case '/login':
      return 'login';
    case '/':
    case '/dashboard':
    default:
      return 'home';
  }
}

function pathFromModule(module: Module): AppRoute {
  switch (module) {
    case 'orders':
      return '/orders';
    case 'offers':
      return '/offers';
    case 'profile':
      return '/profile';
    case 'menu':
      return '/menu';
    case 'cart':
      return '/cart';
    case 'reservation':
      return '/reservation';
    case 'queue':
      return '/queue';
    case 'tracking':
      return '/tracking';
    case 'history':
      return '/history';
    case 'feedback':
      return '/feedback';
    case 'settings':
      return '/settings';
    case 'notifications':
      return '/notifications';
    case 'login':
      return '/login';
    case 'home':
    default:
      return '/dashboard';
  }
}

const FAVORITES_STORAGE_KEY = 'favorites.v1';

function loadFavoritesFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === 'string');
  } catch {
    return [];
  }
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialModule = useMemo(() => moduleFromPath(window.location.pathname), []);
  const [activeModule, setActiveModule] = useState<Module>(initialModule);
  const initialFavorites = useMemo(() => loadFavoritesFromStorage(), []);
  const [appState, setAppState] = useState<AppState>({
    isLoggedIn: false,
    user: null,
    cart: [],
    orders: [],
    currentOrder: null,
    queueNumber: null,
    notifications: []
  });

  useEffect(() => {
    if (!appState.user) {
      localStorage.removeItem(FAVORITES_STORAGE_KEY);
      return;
    }
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(appState.user.favorites ?? []));
  }, [appState.user]);

  useEffect(() => {
    const normalized = normalizePathname(location.pathname);
    if (!normalized || normalized === '/') {
      navigate('/dashboard', { replace: true });
      return;
    }

    const moduleFromUrl = moduleFromPath(location.pathname);
    setActiveModule((prev) => (prev === moduleFromUrl ? prev : moduleFromUrl));
  }, [location.pathname, navigate]);

  useEffect(() => {
    const userId = appState.user?.email;
    if (!userId) return;

    let cancelled = false;
    fetchOrders(userId)
      .then((orders) => {
        if (!cancelled) setAppState((prev) => ({ ...prev, orders }));
      })
      .catch(() => {
        // keep local state if backend isn't running
      });

    return () => {
      cancelled = true;
    };
  }, [appState.user?.email]);

  const handleModuleChange = (module: Module) => {
    setActiveModule(module);
    const target = pathFromModule(module);
    if (location.pathname !== target) {
      navigate(target);
    }
  };

  const handleLogin = (user: User) => {
    const persistedFavorites = loadFavoritesFromStorage();
    setAppState(prev => ({
      ...prev,
      isLoggedIn: true,
      user: {
        ...user,
        favorites: persistedFavorites.length > 0 ? persistedFavorites : user.favorites,
      }
    }));
    handleModuleChange('menu');
  };

  const handleLogout = () => {
    setAppState({
      isLoggedIn: false,
      user: null,
      cart: [],
      orders: [],
      currentOrder: null,
      queueNumber: null,
      notifications: []
    });
    handleModuleChange('home');
  };

  const updateAppState = (updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  const persistUserUpdate = async (nextUser: User) => {
    const currentEmail = appState.user?.email || nextUser.email;
    try {
      const updated = await updateUserProfile(currentEmail, nextUser);
      updateAppState({ user: updated });
    } catch {
      // Keep local state if backend isn't available.
    }
  };

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setAppState(prev => {
      const existingItem = prev.cart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return {
          ...prev,
          cart: prev.cart.map(cartItem =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + (item.quantity || 1) }
              : cartItem
          )
        };
      }
      return {
        ...prev,
        cart: [...prev.cart, { ...item, quantity: item.quantity || 1 }]
      };
    });
  };

  const updateCartItem = (id: string, quantity: number) => {
    setAppState(prev => ({
      ...prev,
      cart: quantity === 0
        ? prev.cart.filter(item => item.id !== id)
        : prev.cart.map(item => item.id === id ? { ...item, quantity } : item)
    }));
  };

  const removeFromCart = (id: string) => {
    setAppState(prev => ({
      ...prev,
      cart: prev.cart.filter(item => item.id !== id)
    }));
  };

  const clearCart = () => {
    setAppState(prev => ({ ...prev, cart: [] }));
  };

  const toggleFavorite = (itemId: string) => {
    if (!appState.user) return;

    const favorites = appState.user.favorites.includes(itemId)
      ? appState.user.favorites.filter(id => id !== itemId)
      : [...appState.user.favorites, itemId];

    const nextUser = { ...appState.user, favorites };
    updateAppState({ user: nextUser });
    void persistUserUpdate(nextUser);
  };
  
  const renderActiveModule = () => {
    switch (activeModule) {
      case 'home':
        return <Home isLoggedIn={appState.isLoggedIn} onNavigate={handleModuleChange} />;
      case 'login':
        return <LoginRegister onLogin={handleLogin} />;
      case 'profile':
        if (!appState.user) return <LoginRegister onLogin={handleLogin} />;
        return (
          <Profile
            user={appState.user}
            onUpdateUser={async (user) => {
              if (!appState.user) return;
              const updated = await updateUserProfile(appState.user.email, user);
              updateAppState({ user: updated });
            }}
            onLogout={handleLogout}
            orders={appState.orders}
            onReorder={(items) => {
              items.forEach((item) => addToCart(item));
              handleModuleChange('cart');
            }}
          />
        );
      case 'reservation':
        if (!appState.user) return <LoginRegister onLogin={handleLogin} />;
        return <Reservation user={appState.user} />;
      case 'queue':
        return <Queue queueNumber={appState.queueNumber} onJoinQueue={(num) => updateAppState({ queueNumber: num })} />;
      case 'menu':
        return (
          <Menu
            isLoggedIn={appState.isLoggedIn}
            user={appState.user || undefined}
            onAddToCart={addToCart}
            onNavigate={handleModuleChange}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'cart':
        return (
          <Cart
            cart={appState.cart}
            user={appState.user || undefined}
            onUpdateQuantity={updateCartItem}
            onRemoveItem={removeFromCart}
            onCheckout={(order) => {
              updateAppState({
                currentOrder: order,
                orders: [...appState.orders, order]
              });
              createOrder(order, appState.user?.email).catch(() => {
                // ignore; app still works offline
              });
              clearCart();
              handleModuleChange('tracking');
            }}
          />
        );
      case 'orders':
        return (
          <Orders
            currentOrder={appState.currentOrder}
            onNavigate={handleModuleChange}
          />
        );
      case 'offers':
        if (!appState.user) return <LoginRegister onLogin={handleLogin} />;
        return (
          <OffersLoyalty
            user={appState.user}
            onUpdateUser={async (user) => {
              await persistUserUpdate(user);
            }}
          />
        );
      case 'settings':
        return (
          appState.user ? (
            <Settings
              user={appState.user}
              notifications={appState.notifications}
              onMarkAsRead={(id) => {
                updateAppState({
                  notifications: appState.notifications.map((n) =>
                    n.id === id ? { ...n, read: true } : n
                  )
                });
              }}
              onLogout={handleLogout}
            />
          ) : (
            <LoginRegister onLogin={handleLogin} />
          )
        );
      case 'tracking':
        return <OrderTracking order={appState.currentOrder} />;
      case 'history':
        return <OrderHistory orders={appState.orders} onReorder={(items) => {
          items.forEach(item => addToCart(item));
          handleModuleChange('cart');
        }} />;
      case 'feedback':
        if (!appState.user) return <LoginRegister onLogin={handleLogin} />;
        return <Feedback user={appState.user} orders={appState.orders} />;
      case 'notifications':
        return <NotificationsPage />;
      default:
        return <Home isLoggedIn={appState.isLoggedIn} onNavigate={handleModuleChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopDashboard
        activeModule={activeModule}
        isLoggedIn={appState.isLoggedIn}
        cartItemCount={appState.cart.length}
        onModuleChange={handleModuleChange}
        onLogout={handleLogout}
        user={appState.user}
        showModuleNav={activeModule !== 'login'}
      />
      <main className={appState.isLoggedIn && activeModule !== 'login' ? 'pt-36' : 'pt-20'}>
        {renderActiveModule()}
      </main>
    </div>
  );
}