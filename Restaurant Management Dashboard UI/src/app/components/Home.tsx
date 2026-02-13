import { ArrowRight, Star, Clock, MapPin, ChefHat, Sparkles, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Module } from "@/app/App";
import type { MenuItem } from "@/app/data/menuData";
import { menuData } from "@/app/data/menuData";
import { fetchMenuItems } from "@/api/menu";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { MenuItemImage } from "@/app/components/MenuItemImage";
import heroImage from '@/assets/8fa912dede0bd681dd44e46c538c6cbb3492342b.png';
import quoteBgImage from '@/assets/11b317025b5248eac9baeb9967cf61a1383601ed.png';
import zomatoLogo from '@/assets/efcc35a43183f90782eea17a5e13fcfbea8e6b6f.png';
import swiggyLogo from '@/assets/eb8cf434a2005ac902c1a31613aef16d630cf894.png';
import blinkitLogo from '@/assets/c6a86088a1be459ac33923b1019c40d9a054ae05.png';
import aboutBgImage from '@/assets/451f83ee2533052ab60bf543996c6b8187cd16b6.png';

interface HomeProps {
  isLoggedIn: boolean;
  onNavigate: (module: Module) => void;
}

export default function Home({
  isLoggedIn,
  onNavigate,
}: HomeProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

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

  const popularItems = useMemo(() => {
    return menuItems.filter((item) => item.popular).slice(0, 6);
  }, [menuItems]);

  // Customer reviews data
  const reviews = [
    {
      id: 1,
      name: "Priya Sharma",
      rating: 5,
      comment: "The best Indian restaurant I've been to! The Dal Makhani is absolutely divine.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
    },
    {
      id: 2,
      name: "Rahul Patel",
      rating: 5,
      comment: "Exceptional service and authentic flavors. The Butter Chicken is a must-try!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
    },
    {
      id: 3,
      name: "Anjali Reddy",
      rating: 5,
      comment: "Love the ambiance and the food quality. Their biryani is outstanding!",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* SECTION 1 — HERO HEADER */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={heroImage}
            alt="Royal Cuisine Indian Food"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/50"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center px-6">
          <h1 
            className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-2xl leading-tight" 
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Urban Bites
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-light mb-12 max-w-3xl mx-auto leading-relaxed italic">
            "Home of taste where food is prepared with care, quality ingredients, and attention to taste."
          </p>
          <button
            onClick={() => onNavigate(isLoggedIn ? "menu" : "login")}
            className="px-12 py-5 bg-gradient-to-r from-[#8B5A2B] to-[#C8A47A] text-white rounded-2xl hover:shadow-[0_15px_30px_-10px_rgba(200,164,122,0.6)] transition-all duration-300 text-lg font-black uppercase tracking-[0.15em] inline-flex items-center gap-3 active:scale-95"
          >
            {isLoggedIn ? "Explore Menu" : "Get Started"}
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Show full content only if logged in */}
      {isLoggedIn && (
        <>
          {/* SECTION 2 — ABOUT US / SUBHEADER */}
          <section className="relative w-full py-32 overflow-hidden">
            <div className="absolute inset-0">
              <ImageWithFallback
                src={aboutBgImage}
                alt="Royal Cuisine Dining Experience"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#2D1B10]/95 via-[#2D1B10]/80 to-[#2D1B10]/40"></div>
            </div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Empty left side for visual balance */}
                <div className="hidden lg:block"></div>
                
                {/* Content on right side */}
                <div>
                  <div className="inline-block mb-6 px-5 py-2 bg-[#C8A47A]/20 backdrop-blur-sm rounded-full border border-[#C8A47A]/30">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A47A]">About Royal Cuisine</span>
                  </div>
                  <h2 
                    className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight" 
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Seamless Dining Experience
                  </h2>
                  <p className="text-xl text-white/90 leading-relaxed font-light mb-6">
                    We provide a seamless restaurant experience with easy ordering and flexible customization based on user preferences.
                  </p>
                  <p className="text-xl text-white/80 leading-relaxed font-light">
                    Our system is designed to deliver quality service while keeping the dining process simple and efficient.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: QUOTE HIGHLIGHT */}
          <section className="relative w-full py-32 overflow-hidden">
            <div className="absolute inset-0">
              <ImageWithFallback
                src={quoteBgImage}
                alt="Inspirational Food Quote"
                className="w-full h-full object-cover blur-[1px]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#2D1B10]/95 to-[#2D1B10]/75"></div>
            </div>
            
            <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
              <p 
                className="text-4xl md:text-6xl text-white mb-10 leading-tight" 
                style={{ fontFamily: "'Great Vibes', cursive" }}
              >
                “Destroy the world if even a single person does not have food.”
              </p>
              <p 
                className="text-[#C8A47A] text-sm font-bold uppercase tracking-[0.4em] inline-block border-t border-[#C8A47A]/30 pt-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                — Bharathiyar
              </p>
            </div>
          </section>

          {/* SECTION 3 — FEATURES / WHAT WE DO */}
          <section className="py-24 px-6 bg-[#FAF7F2]">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-block mb-6 p-1 bg-[#C8A47A] rounded-full px-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3E2723]">What We Offer</span>
                </div>
                <h2 
                  className="text-5xl md:text-6xl font-bold text-[#3E2723] mb-4" 
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Our Specialties
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Feature Card 1 - Styled like menu cards */}
                <div className="group relative bg-[#2D1B10] rounded-[24px] overflow-hidden border border-[#C8A47A]/30 shadow-2xl hover:shadow-[#C8A47A]/20 transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#3E2723] to-[#2D1B10] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10 p-10 text-center">
                    <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-[#C8A47A] to-[#8B5A2B] rounded-full flex items-center justify-center shadow-xl">
                      <Sparkles className="w-12 h-12 text-[#FAF7F2]" strokeWidth={1.5} />
                    </div>
                    <h3 
                      className="text-3xl font-bold text-[#FAF7F2] mb-4 group-hover:text-[#C8A47A] transition-colors" 
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Quality Ingredients
                    </h3>
                    <p className="text-[#EADBC8]/70 text-lg leading-relaxed font-light">
                      We source only the finest and freshest ingredients to ensure every dish is a masterpiece of flavor and quality.
                    </p>
                  </div>
                </div>

                {/* Feature Card 2 */}
                <div className="group relative bg-[#2D1B10] rounded-[24px] overflow-hidden border border-[#C8A47A]/30 shadow-2xl hover:shadow-[#C8A47A]/20 transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#3E2723] to-[#2D1B10] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10 p-10 text-center">
                    <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-[#C8A47A] to-[#8B5A2B] rounded-full flex items-center justify-center shadow-xl">
                      <Clock className="w-12 h-12 text-[#FAF7F2]" strokeWidth={1.5} />
                    </div>
                    <h3 
                      className="text-3xl font-bold text-[#FAF7F2] mb-4 group-hover:text-[#C8A47A] transition-colors" 
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Fast Service
                    </h3>
                    <p className="text-[#EADBC8]/70 text-lg leading-relaxed font-light">
                      Swift and efficient service that respects your time without ever compromising on the quality of your meal.
                    </p>
                  </div>
                </div>

                {/* Feature Card 3 */}
                <div className="group relative bg-[#2D1B10] rounded-[24px] overflow-hidden border border-[#C8A47A]/30 shadow-2xl hover:shadow-[#C8A47A]/20 transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#3E2723] to-[#2D1B10] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10 p-10 text-center">
                    <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-[#C8A47A] to-[#8B5A2B] rounded-full flex items-center justify-center shadow-xl">
                      <MapPin className="w-12 h-12 text-[#FAF7F2]" strokeWidth={1.5} />
                    </div>
                    <h3 
                      className="text-3xl font-bold text-[#FAF7F2] mb-4 group-hover:text-[#C8A47A] transition-colors" 
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Prime Location
                    </h3>
                    <p className="text-[#EADBC8]/70 text-lg leading-relaxed font-light">
                      Strategically located for your convenience, offering both premium dine-in and efficient takeaway services.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4 — POPULAR DISHES (Exact Menu Card Reuse) */}
          <section className="py-24 px-6 bg-[#F5F0E8]">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-block mb-6 p-1 bg-[#C8A47A] rounded-full px-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3E2723]">Customer Favorites</span>
                </div>
                <h2 
                  className="text-5xl md:text-6xl font-bold text-[#3E2723] mb-4" 
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Popular Dishes
                </h2>
                <p className="text-xl text-[#6D4C41] font-light">
                  Discover the dishes our guests can't stop talking about
                </p>
              </div>

              {/* Menu Cards Grid - EXACT styling from Menu component */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {popularItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative bg-[#2D1B10] rounded-[24px] overflow-hidden border border-[#C8A47A]/30 shadow-2xl hover:shadow-[#C8A47A]/20 transition-all duration-500 flex flex-col hover:-translate-y-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-[#3E2723] to-[#2D1B10] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative h-60 bg-[#1A110D] overflow-hidden">
                      <MenuItemImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out"
                      />
                      
                      <div className="absolute top-5 left-5 z-10">
                        <span
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${
                            item.isVeg
                              ? 'bg-green-600/90 text-white backdrop-blur-md'
                              : 'bg-red-600/90 text-white backdrop-blur-md'
                          }`}
                        >
                          {item.isVeg ? 'Vegetarian' : 'Non-Veg'}
                        </span>
                      </div>
                      
                      <div className="absolute top-5 right-5 z-10 flex flex-col gap-2">
                        {item.todaysSpecial && (
                          <span className="bg-[#C8A47A] text-[#2D1B10] px-4 py-1.5 rounded-full text-[10px] font-black shadow-xl flex items-center gap-2 uppercase tracking-widest animate-pulse">
                            <Sparkles className="w-3 h-3" />
                            Today's Special
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="relative z-10 p-8 flex flex-col flex-grow">
                      <div className="mb-3">
                        <h3 className="font-bold text-2xl text-[#FAF7F2] group-hover:text-[#C8A47A] transition-colors duration-300" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {item.name}
                        </h3>
                      </div>
                      <p className="text-sm text-[#EADBC8]/70 mb-6 line-clamp-2 leading-relaxed font-light">
                        {item.description}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between border-t border-[#C8A47A]/20 pt-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#C8A47A] uppercase tracking-[0.2em] font-black mb-1">Price</span>
                          <span className="text-3xl font-black text-[#FAF7F2]">₹{item.price}</span>
                        </div>
                        
                        {!isLoggedIn && (
                          <button
                            onClick={() => onNavigate('login')}
                            className="px-6 py-3 bg-[#3E2723] text-[#C8A47A] border border-[#C8A47A]/50 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-[#C8A47A] hover:text-[#2D1B10] transition-all duration-300 active:scale-95 shadow-xl"
                          >
                            Login
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-16">
                <button
                  onClick={() => onNavigate("menu")}
                  className="px-10 py-5 bg-gradient-to-r from-[#3E2723] to-[#8B5A2B] text-white rounded-2xl font-black text-lg uppercase tracking-widest hover:shadow-2xl transition-all inline-flex items-center gap-3 active:scale-95"
                >
                  View Full Menu
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 5 — CUSTOMER REVIEWS */}
          <section className="py-24 px-6 bg-[#FAF7F2]">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-block mb-6 p-1 bg-[#C8A47A] rounded-full px-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3E2723]">Testimonials</span>
                </div>
                <h2 
                  className="text-5xl md:text-6xl font-bold text-[#3E2723] mb-4" 
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  What Our Guests Say
                </h2>
                <p className="text-xl text-[#6D4C41] font-light">
                  Real experiences from our valued customers
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="group relative bg-[#2D1B10] rounded-[24px] overflow-hidden border border-[#C8A47A]/30 shadow-2xl hover:shadow-[#C8A47A]/20 transition-all duration-500 hover:-translate-y-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-[#3E2723] to-[#2D1B10] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10 p-10">
                      <div className="flex items-center mb-6">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-[#C8A47A] mr-4 border-4 border-[#C8A47A]/30">
                          <ImageWithFallback
                            src={review.avatar}
                            alt={review.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-[#FAF7F2]" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {review.name}
                          </h4>
                          <div className="flex gap-1 mt-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-[#C8A47A] text-[#C8A47A]" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-[#EADBC8]/80 text-base leading-relaxed font-light italic">
                        "{review.comment}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION: SPONSORS / DELIVERY PARTNERS */}
          <section className="py-24 px-6 bg-[#F5F0E8]">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-block mb-6 p-1 bg-[#C8A47A] rounded-full px-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3E2723]">Our Network</span>
                </div>
                <h2 
                  className="text-4xl md:text-5xl font-bold text-[#3E2723] mb-4" 
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Order From Our Partners
                </h2>
                <p className="text-lg text-[#6D4C41] font-light max-w-2xl mx-auto">
                  Experience our authentic cuisine delivered to your doorstep through trusted partners
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { 
                    name: "Zomato", 
                    bgGradient: "from-red-50 to-red-100/50", 
                    logo: zomatoLogo,
                    description: "Order our dishes instantly",
                    accentColor: "#E23744"
                  },
                  { 
                    name: "Swiggy", 
                    bgGradient: "from-orange-50 to-orange-100/50", 
                    logo: swiggyLogo,
                    description: "Fast delivery, hot food",
                    accentColor: "#FC8019"
                  },
                  { 
                    name: "Blinkit", 
                    bgGradient: "from-yellow-50 to-yellow-100/50", 
                    logo: blinkitLogo,
                    description: "Quick grocery delivery",
                    accentColor: "#FFD41C"
                  }
                ].map((partner) => (
                  <div 
                    key={partner.name}
                    className="group relative bg-white rounded-[24px] overflow-hidden border-2 border-[#E8DED0] shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer"
                  >
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${partner.bgGradient} opacity-40 group-hover:opacity-60 transition-opacity duration-500`}></div>
                    
                    {/* Card Content */}
                    <div className="relative z-10 p-10 flex flex-col items-center text-center min-h-[280px]">
                      {/* Logo Container */}
                      <div className="w-32 h-32 mb-6 bg-white rounded-[20px] shadow-xl flex items-center justify-center p-6 group-hover:scale-110 group-hover:shadow-2xl transition-all duration-500">
                        <ImageWithFallback
                          src={partner.logo}
                          alt={`${partner.name} logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {/* Partner Name */}
                      <h3 
                        className="text-2xl font-bold text-[#3E2723] mb-3 group-hover:text-[#8B5A2B] transition-colors duration-300"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {partner.name}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-[#6D4C41] text-sm font-light mb-4 leading-relaxed">
                        {partner.description}
                      </p>
                      
                      {/* CTA */}
                      <div className="flex items-center gap-2 text-[#8B5A2B] font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                        <span>Check it out</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                    
                    {/* Hover accent line */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ backgroundColor: partner.accentColor }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* SECTION 6 — FOOTER */}
      <footer className="bg-[#2D1B10] text-[#FAF7F2] py-16 px-6 border-t border-[#C8A47A]/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <h3 
                className="text-3xl font-bold mb-4 text-[#C8A47A]" 
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Royal Cuisine
              </h3>
              <p className="text-[#EADBC8]/70 font-light leading-relaxed">
                Experience authentic Indian cuisine with royal hospitality and premium service.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xl font-bold mb-4 text-[#C8A47A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Contact
              </h4>
              <ul className="space-y-3 text-[#EADBC8]/70 font-light">
                <li>Phone: +91 98765 43210</li>
                <li>Email: info@royalcuisine.com</li>
                <li>Hours: 11 AM - 11 PM</li>
              </ul>
            </div>

            {/* Address */}
            <div>
              <h4 className="text-xl font-bold mb-4 text-[#C8A47A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Address
              </h4>
              <p className="text-[#EADBC8]/70 font-light leading-relaxed">
                123 Royal Street,<br />
                Cuisine District,<br />
                Mumbai - 400001, India
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-bold mb-4 text-[#C8A47A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Quick Links
              </h4>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => onNavigate('menu')}
                    className="text-[#EADBC8]/70 hover:text-[#C8A47A] transition-colors font-light"
                  >
                    Menu
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('reservation')}
                    className="text-[#EADBC8]/70 hover:text-[#C8A47A] transition-colors font-light"
                  >
                    Reservations
                  </button>
                </li>
                <li>
                  <a href="#" className="text-[#EADBC8]/70 hover:text-[#C8A47A] transition-colors font-light">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#EADBC8]/70 hover:text-[#C8A47A] transition-colors font-light">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[#C8A47A]/20 text-center">
            <p className="text-[#EADBC8]/60 text-sm font-light">
              © 2024 Royal Cuisine. All rights reserved. Crafted with passion for food lovers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}