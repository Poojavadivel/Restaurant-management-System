import { useState, useRef, useEffect } from 'react';
import { X, Send, ArrowLeft, Phone, MapPin, Clock } from 'lucide-react';
import type { MenuItem } from '@/app/data/menuData';
import { menuData } from '@/app/data/menuData';
import { fetchMenuItems } from '@/api/menu';
import chatbotIcon from "@/assets/477edf60f9c7da94cbe6fd9ff229326d5e74932b.png";

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  text?: string;
  buttons?: Array<{ label: string; action: string; data?: any }>;
  items?: MenuItem[];
}

interface ChatbotProps {
  onNavigateToMenu?: () => void;
}

export default function Chatbot({ onNavigateToMenu }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [navigationStack, setNavigationStack] = useState<string[]>(['main']);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial welcome message
      setTimeout(() => {
        addBotMessage(
          "Hi, I am Suvai AI, Welcome to the home of taste, how can I help you?",
          getMainMenuButtons()
        );
      }, 300);
    }
  }, [isOpen]);

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

  const addBotMessage = (text?: string, buttons?: ChatMessage['buttons'], items?: MenuItem[]) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'bot',
      text,
      buttons,
      items
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      text
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const getMainMenuButtons = () => [
    { label: '🛎️ Browse Menu', action: 'browse_menu' },
    { label: '✨ Today\'s Specials', action: 'todays_specials' },
    { label: '⚙️ Any Issues', action: 'issues' },
    { label: '☎️ Contact', action: 'contact' },
    { label: '🎊 Offers', action: 'offers' },
    { label: '🎯 What\'s Your Mood?', action: 'mood' }
  ];

  const handleButtonClick = (action: string, data?: any) => {
    // Add user's selection as a message
    const button = messages[messages.length - 1]?.buttons?.find(b => b.action === action);
    if (button) {
      addUserMessage(button.label);
    }

    switch (action) {
      case 'browse_menu':
        handleBrowseMenu();
        break;
      case 'todays_specials':
        handleTodaysSpecials();
        break;
      case 'issues':
        handleIssues();
        break;
      case 'contact':
        handleContact();
        break;
      case 'offers':
        handleOffers();
        break;
      case 'mood':
        handleMoodMenu();
        break;
      case 'issue_type':
        handleIssueType(data);
        break;
      case 'mood_type':
        handleMoodType(data);
        break;
      case 'time_based':
        handleTimeBased(data);
        break;
      case 'mood_based':
        handleMoodBased(data);
        break;
      case 'health_based':
        handleHealthBased(data);
        break;
      case 'back_to_main':
        handleBackToMain();
        break;
      default:
        break;
    }
  };

  const handleBrowseMenu = () => {
    setNavigationStack(prev => [...prev, 'browse_menu']);
    addBotMessage(
      "Great! I can help you explore our menu. Here are our categories:",
      [
        { label: '🥗 Starters', action: 'browse_category', data: 'Starters' },
        { label: '🍛 Main Course', action: 'browse_category', data: 'Main Course' },
        { label: '🍞 Breads', action: 'browse_category', data: 'Breads' },
        { label: '🍰 Desserts', action: 'browse_category', data: 'Desserts' },
        { label: '🥤 Beverages', action: 'browse_category', data: 'Beverages' },
        { label: '🔙 Back to Main Menu', action: 'back_to_main' }
      ]
    );
  };

  const handleTodaysSpecials = () => {
    setNavigationStack(prev => [...prev, 'todays_specials']);
    const specials = menuItems.filter(item => item.todaysSpecial);
    
    if (specials.length > 0) {
      addBotMessage(
        "Here are today's special dishes that our chef recommends:",
        [{ label: '🔙 Back to Main Menu', action: 'back_to_main' }],
        specials
      );
    } else {
      addBotMessage(
        "We don't have any special dishes marked for today, but all our popular items are worth trying!",
        getMainMenuButtons()
      );
    }
  };

  const handleIssues = () => {
    setNavigationStack(prev => [...prev, 'issues']);
    addBotMessage(
      "I'm here to help! What kind of issue are you facing?",
      [
        { label: '📦 Order Issues', action: 'issue_type', data: 'order' },
        { label: '📋 Menu Issues', action: 'issue_type', data: 'menu' },
        { label: '💳 Payment Issues', action: 'issue_type', data: 'payment' },
        { label: '🔙 Back to Main Menu', action: 'back_to_main' }
      ]
    );
  };

  const handleIssueType = (type: string) => {
    setNavigationStack(prev => [...prev, 'issue_detail']);
    let responseText = '';
    
    switch (type) {
      case 'order':
        responseText = "For order-related issues:\n\n• Check your order status in the Orders section\n• Contact our support team at +91 98765 43210\n• Our team will assist you within 15 minutes";
        break;
      case 'menu':
        responseText = "For menu-related queries:\n\n• All menu items are updated daily\n• If an item is unavailable, please try our other popular dishes\n• Contact us for special dietary requirements";
        break;
      case 'payment':
        responseText = "For payment issues:\n\n• We accept all major payment methods\n• If payment failed, please retry or contact support\n• Refunds are processed within 3-5 business days\n• Support: +91 98765 43210";
        break;
    }
    
    addBotMessage(
      responseText,
      [{ label: '🔙 Back to Main Menu', action: 'back_to_main' }]
    );
  };

  const handleContact = () => {
    setNavigationStack(prev => [...prev, 'contact']);
    addBotMessage(
      "📞 Contact Information\n\n" +
      "Phone: +91 98765 43210\n" +
      "Email: info@suvairestaurant.com\n\n" +
      "📍 Address:\n" +
      "123 Taste Street, Food District\n" +
      "Chennai, Tamil Nadu 600001\n\n" +
      "🕒 Working Hours:\n" +
      "Mon - Sun: 11:00 AM - 11:00 PM\n" +
      "Kitchen closes at 10:30 PM",
      [{ label: '🔙 Back to Main Menu', action: 'back_to_main' }]
    );
  };

  const handleOffers = () => {
    setNavigationStack(prev => [...prev, 'offers']);
    const itemsWithOffers = menuItems.filter(item => item.offer);
    
    let offerText = "🎊 Active Offers:\n\n";
    offerText += "1. Weekend Special: 15% off on all orders above ₹500\n";
    offerText += "2. Lunch Deal: Get 10% off between 12 PM - 3 PM\n";
    offerText += "3. Loyalty Points: Earn 1 point for every ₹100 spent\n\n";
    
    if (itemsWithOffers.length > 0) {
      offerText += "Items with special offers:";
      addBotMessage(
        offerText,
        [{ label: '🔙 Back to Main Menu', action: 'back_to_main' }],
        itemsWithOffers
      );
    } else {
      addBotMessage(
        offerText + "\nCheck our menu regularly for item-specific offers!",
        [{ label: '🔙 Back to Main Menu', action: 'back_to_main' }]
      );
    }
  };

  const handleMoodMenu = () => {
    setNavigationStack(prev => [...prev, 'mood']);
    addBotMessage(
      "Let me help you find the perfect dish! How would you like me to suggest?",
      [
        { label: '⏰ Time-Based Suggestions', action: 'mood_type', data: 'time' },
        { label: '😊 Mood-Based Suggestions', action: 'mood_type', data: 'mood' },
        { label: '🥗 Health-Oriented Suggestions', action: 'mood_type', data: 'health' },
        { label: '🔙 Back to Main Menu', action: 'back_to_main' }
      ]
    );
  };

  const handleMoodType = (type: string) => {
    setNavigationStack(prev => [...prev, `mood_${type}`]);
    
    switch (type) {
      case 'time':
        addBotMessage(
          "What time are you planning to eat?",
          [
            { label: '☀️ Day (Light Meals)', action: 'time_based', data: 'day' },
            { label: '🌆 Evening (Snacks)', action: 'time_based', data: 'evening' },
            { label: '🌙 Night (Dinner)', action: 'time_based', data: 'night' },
            { label: '🔙 Back', action: 'mood' }
          ]
        );
        break;
      case 'mood':
        addBotMessage(
          "How are you feeling today?",
          [
            { label: '😊 Happy', action: 'mood_based', data: 'happy' },
            { label: '😔 Sad', action: 'mood_based', data: 'sad' },
            { label: '🤩 Excited', action: 'mood_based', data: 'excited' },
            { label: '🔙 Back', action: 'mood' }
          ]
        );
        break;
      case 'health':
        addBotMessage(
          "What are your health preferences?",
          [
            { label: '🌱 Low Calorie (< 300 kcal)', action: 'health_based', data: 'low_calorie' },
            { label: '💪 High Protein (> 400 kcal)', action: 'health_based', data: 'high_protein' },
            { label: '⚖️ Balanced (300-400 kcal)', action: 'health_based', data: 'balanced' },
            { label: '🔙 Back', action: 'mood' }
          ]
        );
        break;
    }
  };

  const handleTimeBased = (time: string) => {
    setNavigationStack(prev => [...prev, `time_${time}`]);
    let suggestions: MenuItem[] = [];
    let message = '';
    
    switch (time) {
      case 'day':
        // Light meals - beverages, desserts, light starters
        suggestions = menuItems.filter(item => 
          item.category === 'Beverages' || 
          item.category === 'Desserts' ||
          (item.category === 'Starters' && item.calories < 300)
        ).slice(0, 3);
        message = "For a light daytime meal, I recommend these refreshing options:";
        break;
      case 'evening':
        // Snacks - starters and beverages
        suggestions = menuItems.filter(item => 
          item.category === 'Starters' || item.category === 'Beverages'
        ).slice(0, 3);
        message = "Perfect evening snacks to enjoy with tea or coffee:";
        break;
      case 'night':
        // Dinner - main course items
        suggestions = menuItems.filter(item => 
          item.category === 'Main Course'
        ).slice(0, 3);
        message = "For a satisfying dinner, here are our recommended main courses:";
        break;
    }
    
    addBotMessage(
      message,
      [{ label: '🔙 Back to Main Menu', action: 'back_to_main' }],
      suggestions
    );
  };

  const handleMoodBased = (mood: string) => {
    setNavigationStack(prev => [...prev, `mood_${mood}`]);
    let suggestions: MenuItem[] = [];
    let message = '';
    
    switch (mood) {
      case 'happy':
        // Popular dishes
        suggestions = menuItems.filter(item => item.popular).slice(0, 3);
        message = "Celebrate your happiness with our most popular dishes!";
        break;
      case 'sad':
        // Comfort food - desserts and creamy items
        suggestions = menuItems.filter(item => 
          item.category === 'Desserts' || 
          item.name.toLowerCase().includes('butter') ||
          item.name.toLowerCase().includes('creamy')
        ).slice(0, 3);
        message = "You seem a little down. Our comfort foods will surely cheer you up!";
        break;
      case 'excited':
        // Special and spicy items
        suggestions = menuItems.filter(item => 
          item.todaysSpecial || 
          item.name.toLowerCase().includes('tikka') ||
          item.name.toLowerCase().includes('kabab')
        ).slice(0, 3);
        message = "Match your excitement with these amazing special dishes!";
        break;
    }
    
    addBotMessage(
      message,
      [{ label: '🔙 Back to Main Menu', action: 'back_to_main' }],
      suggestions
    );
  };

  const handleHealthBased = (healthType: string) => {
    setNavigationStack(prev => [...prev, `health_${healthType}`]);
    let suggestions: MenuItem[] = [];
    let message = '';
    
    switch (healthType) {
      case 'low_calorie':
        suggestions = menuItems.filter(item => item.calories < 300).slice(0, 3);
        message = "These light and low-calorie options are perfect for you—enjoy without worry!";
        break;
      case 'high_protein':
        // High calorie items usually have more protein
        suggestions = menuItems.filter(item => 
          item.calories > 400 && !item.isVeg
        ).slice(0, 3);
        message = "Power up with these high-protein dishes!";
        break;
      case 'balanced':
        suggestions = menuItems.filter(item => 
          item.calories >= 300 && item.calories <= 400
        ).slice(0, 3);
        message = "These perfectly balanced dishes offer nutrition and taste!";
        break;
    }
    
    if (suggestions.length === 0) {
      addBotMessage(
        "We don't have items matching that exact criteria, but let me show you our closest options:",
        [{ label: '🔙 Back to Main Menu', action: 'back_to_main' }],
        menuItems.slice(0, 3)
      );
    } else {
      addBotMessage(
        message,
        [{ label: '🔙 Back to Main Menu', action: 'back_to_main' }],
        suggestions
      );
    }
  };

  const handleBackToMain = () => {
    setNavigationStack(['main']);
    addBotMessage(
      "How else can I help you?",
      getMainMenuButtons()
    );
  };

  const handleCategoryBrowse = (category: string) => {
    const items = menuItems.filter(item => item.category === category);
    addBotMessage(
      `Here are our ${category}:`,
      [{ label: '🔙 Back to Categories', action: 'browse_menu' }],
      items
    );
  };

  // Handle category browsing
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.buttons) {
      const categoryButton = lastMessage.buttons.find(b => b.action === 'browse_category');
      if (categoryButton) {
        // This will be handled when button is clicked
      }
    }
  }, [messages]);

  // Custom handler for category browse
  const handleCategoryClick = (category: string) => {
    addUserMessage(`🔍 ${category}`);
    handleCategoryBrowse(category);
  };

  return (
    <>
      {/* Floating Chatbot Icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 overflow-hidden border-4 border-[#8B5A2B]"
        >
          <img 
            src={chatbotIcon} 
            alt="Suvai AI" 
            className="w-full h-full object-cover"
          />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border-2 border-[#8B5A2B]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8B5A2B] to-[#6B4423] text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={chatbotIcon} 
                alt="Suvai AI" 
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <div>
                <h3 className="font-semibold text-lg">Suvai AI</h3>
                <p className="text-xs text-white/80">Your Food Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF7F2]">
            {messages.map((message) => (
              <div key={message.id}>
                {message.type === 'user' ? (
                  <div className="flex justify-end">
                    <div className="bg-[#8B5A2B] text-white px-4 py-2 rounded-2xl rounded-tr-none max-w-[80%]">
                      {message.text}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start">
                    <div className="space-y-2 max-w-[85%]">
                      {message.text && (
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-[#8B5A2B]/20 whitespace-pre-line">
                          {message.text}
                        </div>
                      )}
                      
                      {/* Display menu items if present */}
                      {message.items && message.items.length > 0 && (
                        <div className="space-y-2">
                          {message.items.map((item) => (
                            <div
                              key={item.id}
                              className="bg-white rounded-xl shadow-sm border border-[#8B5A2B]/20 overflow-hidden hover:shadow-md transition-shadow"
                            >
                              <div className="flex gap-3 p-3">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-semibold text-[#8B5A2B] text-sm">
                                      {item.name}
                                    </h4>
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {item.description}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-[#8B5A2B] font-bold text-sm">
                                      ₹{item.price}
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <span>{item.calories} kcal</span>
                                      {item.offer && (
                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                          {item.offer}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Display buttons if present */}
                      {message.buttons && message.buttons.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {message.buttons.map((button, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                if (button.action === 'browse_category' && button.data) {
                                  handleCategoryClick(button.data);
                                } else {
                                  handleButtonClick(button.action, button.data);
                                }
                              }}
                              className="bg-white hover:bg-[#8B5A2B] hover:text-white border border-[#8B5A2B] text-[#8B5A2B] px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
                            >
                              {button.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="p-3 bg-white border-t border-[#8B5A2B]/20 rounded-b-2xl">
            <div className="text-xs text-center text-gray-500">
              Powered by Suvai AI • All suggestions from our menu
            </div>
          </div>
        </div>
      )}
    </>
  );
}
