export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isVeg: boolean;
  category: string;
  available: boolean;
  popular?: boolean;
  todaysSpecial?: boolean; // Dynamic tag for daily featured items
  calories: number; // Calories in kcal
  prepTime: string; // Preparation time (e.g., "15-20 mins")
  offer?: string; // Optional offer/deal (e.g., "10% OFF")
}

export const menuData: MenuItem[] = [
  // Veg Starters
  {
    id: "v1",
    name: "Paneer Tikka",
    description: "Grilled cottage cheese marinated in spices",
    price: 250,
    image:
      "https://images.unsplash.com/photo-1690401769082-5f475f87fb22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYW5lZXIlMjB0aWtrYSUyMGluZGlhbiUyMGFwcGV0aXplcnxlbnwxfHx8fDE3NzAwMzI4OTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    isVeg: true,
    category: "Starters",
    available: true,
    popular: true,
    calories: 280,
    prepTime: "15-20 mins",
  },
  {
    id: "v2",
    name: "Vegetable Spring Rolls",
    description: "Crispy rolls filled with fresh vegetables",
    price: 180,
    image:
      "https://images.unsplash.com/photo-1761315413785-0bf98364ceab?crop=entropy&cs=tinysrgb&fit=max&q=80&w=1080",
    isVeg: true,
    category: "Starters",
    available: true,
    calories: 210,
    prepTime: "12-15 mins",
    offer: "15% OFF",
  },
  {
    id: "v3",
    name: "Hara Bhara Kabab",
    description: "Green vegetable patties with spices",
    price: 200,
    image:
      "https://images.unsplash.com/photo-1599307767316-776533bb941c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHZlZ2V0YWJsZSUyMGtlYmFiJTIwaW5kaWFufGVufDF8fHx8MTc3MDA2NDQwMXww&ixlib=rb-4.1.0&q=80&w=1080",
    isVeg: true,
    category: "Starters",
    available: true,
    calories: 240,
    prepTime: "18-22 mins",
  },

  // Veg Main Course
  {
    id: "v4",
    name: "Dal Makhani",
    description: "Creamy black lentils cooked overnight",
    price: 280,
    image:
      "https://images.unsplash.com/photo-1642821373475-cfd6c7301b18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYWwlMjBtYWtoYW5pJTIwYmxhY2slMjBsZW50aWxzJTIwY3Vycnl8ZW58MXx8fHwxNzcwMDY0Mzg0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    isVeg: true,
    category: "Main Course",
    available: true,
    popular: true,
    todaysSpecial: true,
    calories: 385,
    prepTime: "25-30 mins",
  },
  {
    id: "v5",
    name: "Paneer Butter Masala",
    description: "Cottage cheese in rich tomato gravy",
    price: 320,
    image:
      "https://images.unsplash.com/photo-1708793873401-e8c6c153b76a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYW5lZXIlMjBidXR0ZXIlMjBtYXNhbGElMjBpbmRpYW4lMjBjdXJyeXxlbnwxfHx8fDE3NzAwNjQzODR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    isVeg: true,
    category: "Main Course",
    available: true,
    popular: true,
    calories: 420,
    prepTime: "20-25 mins",
  },
  {
    id: "v6",
    name: "Veg Biryani",
    description: "Aromatic rice with mixed vegetables",
    price: 280,
    image:
      "https://images.unsplash.com/photo-1630409346824-4f0e7b080087?q=80&w=2146&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    isVeg: true,
    category: "Main Course",
    available: true,
    calories: 450,
    prepTime: "30-35 mins",
    offer: "10% OFF",
  },
  {
    id: "v7",
    name: "Malai Kofta",
    description: "Cottage cheese dumplings in creamy sauce",
    price: 300,
    image:
      "https://images.unsplash.com/photo-1567337710282-00832b415979?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdldGFyaWFuJTIwZHVtcGxpbmdzJTIwaW5kaWFuJTIwY3Vycnl8ZW58MXx8fHwxNzcwMDY0NDAyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    isVeg: true,
    category: "Main Course",
    available: true,
    calories: 395,
    prepTime: "22-28 mins",
  },
  {
    id: "v8",
    name: "Chole Bhature",
    description: "Spicy chickpeas with fluffy fried bread",
    price: 220,
    image:
      "https://images.unsplash.com/photo-1760047550367-3d72fa3053c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBjaGlja3BlYXMlMjBicmVhZCUyMGZyaWVkfGVufDF8fHx8MTc3MDA2NDQxMnww&ixlib=rb-4.1.0&q=80&w=1080",
    isVeg: true,
    category: "Main Course",
    available: true,
    calories: 520,
    prepTime: "25-30 mins",
  },

  // Non-Veg Starters
  {
    id: "nv1",
    name: "Chicken Tikka",
    description: "Grilled chicken pieces marinated in yogurt",
    price: 320,
    image:
      "https://images.unsplash.com/photo-1627799370307-9b2a689bb94f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwdGlra2ElMjB0YW5kb29yaSUyMGdyaWxsZWR8ZW58MXx8fHwxNzcwMDY0Mzg2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    isVeg: false,
    category: "Starters",
    available: true,
    popular: true,
    calories: 310,
    prepTime: "18-22 mins",
  },
  {
    id: "nv2",
    name: "Fish Amritsari",
    description: "Crispy fried fish with spices",
    price: 380,
    image:
      "https://images.unsplash.com/photo-1673432512498-9e1aed6cbd29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXNoJTIwYW1yaXRzYXJpJTIwZnJpZWQlMjBjcmlzcHl8ZW58MXx8fHwxNzcwMDY0Mzg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    isVeg: false,
    category: "Starters",
    available: true,
    calories: 340,
    prepTime: "15-18 mins",
    offer: "20% OFF",
  },
  {
    id: "nv3",
    name: "Mutton Seekh Kabab",
    description: "Minced mutton on skewers",
    price: 400,
    image:
      "https://images.unsplash.com/photo-1749802585605-a459271b4358?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXR0b24lMjBzZWVraCUyMGthYmFiJTIwc2tld2Vyc3xlbnwxfHx8fDE3NzAwNDc5MzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    isVeg: false,
    category: "Starters",
    available: true,
    calories: 380,
    prepTime: "20-25 mins",
  },

  // Non-Veg Main Course
  {
    id: "nv4",
    name: "Butter Chicken",
    description: "Tender chicken in creamy tomato sauce",
    price: 380,
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXR0ZXIlMjBjaGlja2VuJTIwaW5kaWFuJTIwY3Vycnl8ZW58MXx8fHwxNzcwMDQ3OTM0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    isVeg: false,
    category: "Main Course",
    available: true,
    popular: true,
    todaysSpecial: true,
    calories: 490,
    prepTime: "25-30 mins",
  },
  {
    id: "nv5",
    name: "Chicken Biryani",
    description: "Aromatic basmati rice with chicken",
    price: 350,
    image:
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwYmlyeWFuaSUyMHJpY2UlMjBpbmRpYW58ZW58MXx8fHwxNzcwMDY0Mzg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    isVeg: false,
    category: "Main Course",
    available: true,
    popular: true,
    calories: 550,
    prepTime: "30-35 mins",
  },
  {
    id: "nv6",
    name: "Mutton Rogan Josh",
    description: "Slow-cooked mutton in aromatic gravy",
    price: 450,
    image:
      "https://images.unsplash.com/photo-1640542509430-f529fdfce835?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXR0b24lMjByb2dhbiUyMGpvc2glMjBjdXJyeXxlbnwxfHx8fDE3NzAwNDc5MzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    isVeg: false,
    category: "Main Course",
    available: true,
    calories: 520,
    prepTime: "35-40 mins",
    offer: "Free Dessert",
  },
  {
    id: "nv7",
    name: "Fish Curry",
    description: "Fresh fish in spicy coconut curry",
    price: 420,
    image:
      "https://images.unsplash.com/photo-1626508035297-0cd27c397d67?crop=entropy&cs=tinysrgb&fit=max&q=80&w=1080",
    isVeg: false,
    category: "Main Course",
    available: true,
    calories: 360,
    prepTime: "20-25 mins",
  },
  {
    id: "nv8",
    name: "Chicken Korma",
    description: "Chicken in mild creamy sauce with nuts",
    price: 360,
    image:
      "https://images.unsplash.com/photo-1728542575492-47e02eb3305c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwa29ybWElMjBjcmVhbXklMjBjdXJyeXxlbnwxfHx8fDE3NzAwNDc5MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    isVeg: false,
    category: "Main Course",
    available: true,
    calories: 440,
    prepTime: "22-28 mins",
  },

  // Breads
  {
    id: "b1",
    name: "Butter Naan",
    description: "Soft leavened bread with butter",
    price: 50,
    image:
      "https://images.unsplash.com/photo-1655979284091-eea0e93405ee?crop=entropy&cs=tinysrgb&fit=max&q=80&w=1080",
    isVeg: true,
    category: "Breads",
    available: true,
    calories: 280,
    prepTime: "8-10 mins",
  },
  {
    id: "b2",
    name: "Garlic Naan",
    description: "Naan bread topped with garlic",
    price: 60,
    image:
      "https://images.unsplash.com/photo-1640625314547-aee9a7696589?crop=entropy&cs=tinysrgb&fit=max&q=80&w=1080",
    isVeg: true,
    category: "Breads",
    available: true,
    calories: 290,
    prepTime: "8-10 mins",
  },
  {
    id: "b3",
    name: "Tandoori Roti",
    description: "Whole wheat flatbread",
    price: 30,
    image:
      "https://images.unsplash.com/photo-1718874560784-d4164371eb38?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    isVeg: true,
    category: "Breads",
    available: true,
    calories: 120,
    prepTime: "6-8 mins",
  },

  // Desserts
  {
    id: "d1",
    name: "Gulab Jamun",
    description: "Soft milk dumplings in sugar syrup",
    price: 120,
    image:
      "https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndWxhYiUyMGphbXVuJTIwaW5kaWFuJTIwc3dlZXQlMjBkZXNzZXJ0fGVufDF8fHx8MTc3MDA2NDM5MXww&ixlib=rb-4.1.0&q=80&w=1080",
    isVeg: true,
    category: "Desserts",
    available: true,
    popular: true,
    todaysSpecial: true,
    calories: 375,
    prepTime: "12-15 mins",
  },
  {
    id: "d2",
    name: "Rasmalai",
    description: "Cottage cheese discs in sweet milk",
    price: 140,
    image:
      "https://images.unsplash.com/photo-1596450514735-111a2fe02935?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYXNtYWxhaSUyMGluZGlhbiUyMGRlc3NlcnQlMjBzd2VldHxlbnwxfHx8fDE3NzAwNDc5Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    isVeg: true,
    category: "Desserts",
    available: true,
    calories: 285,
    prepTime: "10-12 mins",
  },
  {
    id: "d3",
    name: "Kulfi",
    description: "Traditional Indian ice cream",
    price: 100,
    image:
      "https://images.unsplash.com/photo-1610507039576-2e4d2ea93f9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBpY2UlMjBjcmVhbSUyMGZyb3plbiUyMGRlc3NlcnR8ZW58MXx8fHwxNzcwMDYyODA4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    isVeg: true,
    category: "Desserts",
    available: true,
    calories: 220,
    prepTime: "5-8 mins",
  },

  // Beverages
  {
    id: "bv1",
    name: "Mango Lassi",
    description: "Sweet yogurt drink with mango",
    price: 80,
    image:
      "https://images.unsplash.com/photo-1639771884984-88fa62ac7e19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5nbyUyMGxhc3NpJTIweW9ndXJ0JTIwZHJpbmt8ZW58MXx8fHwxNzcwMDQ3OTM4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    isVeg: true,
    category: "Beverages",
    available: true,
    calories: 180,
    prepTime: "3-5 mins",
  },
  {
    id: "bv2",
    name: "Masala Chai",
    description: "Spiced Indian tea",
    price: 40,
    image:
      "https://images.unsplash.com/photo-1628702774354-f09e4a167a8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXNhbGElMjBjaGFpJTIwaW5kaWFuJTIwdGVhfGVufDF8fHx8MTc3MDA2NDM5Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    isVeg: true,
    category: "Beverages",
    available: true,
    calories: 90,
    prepTime: "5-7 mins",
  },
  {
    id: "bv3",
    name: "Fresh Lime Soda",
    description: "Refreshing lime and soda water",
    price: 60,
    image:
      "https://images.unsplash.com/photo-1716925948926-4fb5eaf198d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaW1lJTIwc29kYSUyMGRyaW5rJTIwcmVmcmVzaGluZ3xlbnwxfHx8fDE3NzAwNjQzOTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    isVeg: true,
    category: "Beverages",
    available: true,
    calories: 45,
    prepTime: "2-3 mins",
  },
];

export const categories = [
  "All",
  "Starters",
  "Main Course",
  "Breads",
  "Desserts",
  "Beverages",
];