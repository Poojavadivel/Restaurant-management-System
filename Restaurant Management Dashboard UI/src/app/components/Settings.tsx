import { useState } from 'react';
import { Bell, CheckCircle, Clock, Gift, Package, CreditCard, Lock, User, LogOut, Trash2, Key } from 'lucide-react';
import type { User as UserType } from '@/app/App';

interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

interface SettingsProps {
  user: UserType;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onLogout: () => void;
}

export default function Settings({ user, notifications: userNotifications, onMarkAsRead, onLogout }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'security'>('account');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sample notifications for demo
  const sampleNotifications: Notification[] = [
    {
      id: '1',
      message: 'Your order #ORD-12345 is ready for pickup!',
      time: '5 mins ago',
      read: false
    },
    {
      id: '2',
      message: 'Payment of ₹850 received successfully',
      time: '15 mins ago',
      read: false
    },
    {
      id: '3',
      message: 'New offer: Get 20% off on your next order',
      time: '1 hour ago',
      read: false
    },
    {
      id: '4',
      message: 'Your table reservation for tomorrow at 7 PM is confirmed',
      time: '2 hours ago',
      read: true
    },
    {
      id: '5',
      message: 'You earned 50 loyalty points from your last order',
      time: '1 day ago',
      read: true
    },
    {
      id: '6',
      message: 'Your queue number #145 is being called. Please proceed to the counter.',
      time: '2 days ago',
      read: true
    }
  ];

  const notifications = userNotifications.length > 0 ? userNotifications : sampleNotifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (message: string) => {
    if (message.includes('order') || message.includes('Order')) {
      return <Package className="w-5 h-5 text-blue-600" />;
    } else if (message.includes('payment') || message.includes('Payment')) {
      return <CreditCard className="w-5 h-5 text-green-600" />;
    } else if (message.includes('offer') || message.includes('Offer')) {
      return <Gift className="w-5 h-5 text-purple-600" />;
    } else if (message.includes('reservation') || message.includes('Reservation')) {
      return <Clock className="w-5 h-5 text-orange-600" />;
    } else if (message.includes('queue') || message.includes('Queue')) {
      return <Bell className="w-5 h-5 text-red-600" />;
    } else {
      return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const markAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        onMarkAsRead(notification.id);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and notifications</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-border shadow-sm p-4 space-y-2">
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'account' ? 'bg-primary text-white' : 'text-foreground hover:bg-secondary'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Account</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
                  activeTab === 'notifications' ? 'bg-primary text-white' : 'text-foreground hover:bg-secondary'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="font-medium">Notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute right-3 top-3 bg-destructive text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'security' ? 'bg-primary text-white' : 'text-foreground hover:bg-secondary'
                }`}
              >
                <Lock className="w-5 h-5" />
                <span className="font-medium">Security</span>
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-destructive text-white rounded-lg font-medium hover:bg-destructive/90 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-2xl font-bold mb-6">Account Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Full Name</label>
                      <input
                        type="text"
                        defaultValue={user.name}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                      <input
                        type="email"
                        defaultValue={user.email}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Phone Number</label>
                      <input
                        type="tel"
                        defaultValue={user.phone}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>
                    <div className="pt-4">
                      <button className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-2xl font-bold mb-6">Loyalty Program</h2>
                  <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-300 mb-1">Your Points</p>
                        <p className="text-4xl font-bold">{user.loyaltyPoints}</p>
                      </div>
                      <Gift className="w-12 h-12 text-white opacity-50" />
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <p className="text-sm text-gray-300">
                        Earn points with every order and redeem for exclusive rewards!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                {/* Notification Preferences */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div>
                        <p className="font-semibold">Order Updates</p>
                        <p className="text-sm text-gray-600">Get notified about order status changes</p>
                      </div>
                      <label className="relative inline-block w-12 h-6">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-12 h-6 bg-gray-300 peer-checked:bg-black rounded-full peer transition-colors cursor-pointer"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div>
                        <p className="font-semibold">Offers & Promotions</p>
                        <p className="text-sm text-gray-600">Receive updates about new offers</p>
                      </div>
                      <label className="relative inline-block w-12 h-6">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-12 h-6 bg-gray-300 peer-checked:bg-black rounded-full peer transition-colors cursor-pointer"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div>
                        <p className="font-semibold">Reservation Reminders</p>
                        <p className="text-sm text-gray-600">Get reminded about your reservations</p>
                      </div>
                      <label className="relative inline-block w-12 h-6">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-12 h-6 bg-gray-300 peer-checked:bg-black rounded-full peer transition-colors cursor-pointer"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-semibold">Queue Updates</p>
                        <p className="text-sm text-gray-600">Real-time updates on queue status</p>
                      </div>
                      <label className="relative inline-block w-12 h-6">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-12 h-6 bg-gray-300 peer-checked:bg-black rounded-full peer transition-colors cursor-pointer"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">Recent Notifications</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {unreadCount > 0 ? `${unreadCount} unread notifications` : 'You\'re all caught up!'}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="px-4 py-2 text-sm bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                      >
                        Mark All as Read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">No Notifications</h3>
                      <p className="text-gray-600">You don't have any notifications yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`rounded-lg border p-4 transition-all ${
                            notification.read ? 'border-gray-200 bg-white' : 'border-blue-200 bg-blue-50 bg-opacity-50'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              notification.read ? 'bg-gray-100' : 'bg-white'
                            }`}>
                              {getIcon(notification.message)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className={`mb-1 ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                {notification.message}
                              </p>
                              <p className="text-sm text-gray-500">{notification.time}</p>
                            </div>

                            {/* Status Indicator & Action */}
                            <div className="flex items-center gap-3">
                              {!notification.read && (
                                <>
                                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                  <button
                                    onClick={() => onMarkAsRead(notification.id)}
                                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                  >
                                    Mark as read
                                  </button>
                                </>
                              )}
                              {notification.read && (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-2xl font-bold mb-6">Change Password</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Current Password</label>
                      <input
                        type="password"
                        placeholder="Enter current password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>
                    <div className="pt-4">
                      <button className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-2xl font-bold mb-6">Two-Factor Authentication</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div>
                        <p className="font-semibold">Enable Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <label className="relative inline-block w-12 h-6">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-12 h-6 bg-gray-300 peer-checked:bg-black rounded-full peer transition-colors cursor-pointer"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
                  <h2 className="text-2xl font-bold mb-4 text-red-600">Danger Zone</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      {!showDeleteConfirm ? (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-5 h-5" />
                          Delete Account
                        </button>
                      ) : (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-red-800 mb-3">
                            Are you absolutely sure? This action cannot be undone.
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                alert('Account deletion functionality would be implemented here');
                                setShowDeleteConfirm(false);
                              }}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                              Yes, Delete My Account
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}