import { useState } from 'react';
import { CheckCircle, Mail, Lock, User as UserIcon, Phone, MapPin } from 'lucide-react';
import type { User } from '@/app/App';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { loginUser, registerUser } from '@/api/auth';
import loginBgImage from '@/assets/c8d4f841ccdc9e765477bc41c30b4b89880043c4.png';

interface LoginRegisterProps {
  onLogin: (user: User) => void;
}

export default function LoginRegister({ onLogin }: LoginRegisterProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsProcessing(true);

    try {
      let user: User;
      if (mode === 'register') {
        user = await registerUser({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          password: formData.password,
        });
      } else {
        user = await loginUser({
          email: formData.email,
          password: formData.password,
        });
      }

      onLogin(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to login.';
      setErrorMessage(message);
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-border shadow-lg p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              {mode === 'login' ? 'Welcome Back!' : 'Account Created!'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {mode === 'login'
                ? 'Successfully logged in'
                : 'Your account has been created successfully'}
            </p>
            <div className="animate-pulse text-muted-foreground text-sm">
              Redirecting to menu...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-6">
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src={loginBgImage}
          alt="Urban Bites Food Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Login/Register Box */}
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-[#E8DED0] shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-3 text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-muted-foreground">
              {mode === 'login'
                ? 'Login to continue ordering delicious food'
                : 'Register to get started with exclusive offers'}
            </p>
          </div>

          {/* Toggle Mode */}
          <div className="flex gap-2 mb-6 bg-secondary p-1 rounded-lg">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                mode === 'login' ? 'bg-primary text-white shadow-sm' : 'text-foreground'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                mode === 'register' ? 'bg-primary text-white shadow-sm' : 'text-foreground'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Enter your delivery address"
                    rows={2}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-white py-3.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              {mode === 'login' ? 'Login to Account' : 'Create Account'}
            </button>
          </form>

          {mode === 'register' && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <span className="font-semibold">🎁 Welcome Bonus!</span> Get 100 loyalty points on registration
              </p>
            </div>
          )}

          {mode === 'login' && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-primary font-semibold hover:underline"
              >
                Register now
              </button>
            </div>
          )}

          {mode === 'register' && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-primary font-semibold hover:underline"
              >
                Login here
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}