import { Filter, Flame, Clock, Tag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { MenuItem } from '@/app/data/menuData';
import { categories as sampleCategories, menuData } from '@/app/data/menuData';
import { fetchMenuCategories, fetchMenuItems } from '@/api/menu';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export default function MenuPreview() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterVeg, setFilterVeg] = useState<'all' | 'veg' | 'non-veg'>('all');

  const [categories, setCategories] = useState<string[]>(['All']);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchMenuCategories(), fetchMenuItems()])
      .then(([cats, items]) => {
        if (cancelled) return;
        setCategories(cats);
        setMenuItems(items);
      })
      .catch(() => {
        if (cancelled) return;
        setCategories(sampleCategories);
        setMenuItems(menuData);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory;
      const vegMatch =
        filterVeg === 'all' ||
        (filterVeg === 'veg' && item.isVeg) ||
        (filterVeg === 'non-veg' && !item.isVeg);
      return categoryMatch && vegMatch;
    });
  }, [filterVeg, menuItems, selectedCategory]);

  return (
    <div className="min-h-screen bg-white py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Our Menu</h1>
          <p className="text-gray-600">Explore our delicious offerings</p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Category Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-5 h-5" />
              <span className="font-semibold">Categories</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedCategory === category
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Veg/Non-Veg Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-semibold">Food Type</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterVeg('all')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  filterVeg === 'all'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-300 hover:border-gray-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterVeg('veg')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  filterVeg === 'veg'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-black border-gray-300 hover:border-gray-400'
                }`}
              >
                🟢 Veg Only
              </button>
              <button
                onClick={() => setFilterVeg('non-veg')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  filterVeg === 'non-veg'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-black border-gray-300 hover:border-gray-400'
                }`}
              >
                🔴 Non-Veg Only
              </button>
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-48 bg-gray-100">
                <ImageWithFallback
                  src={`https://source.unsplash.com/featured/400x300/?${encodeURIComponent(item.image)}`}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.isVeg
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                  >
                    {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                  </span>
                </div>
                {!item.available && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                      Not Available
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                
                {/* Info Row: Calories, Prep Time, and Offers */}
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  {/* Calories */}
                  <div className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-gray-500" strokeWidth={1.5} />
                    <span className="text-xs text-gray-500">{item.calories} kcal</span>
                  </div>
                  
                  {/* Preparation Time */}
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-500" strokeWidth={1.5} />
                    <span className="text-xs text-gray-500">{item.prepTime}</span>
                  </div>
                  
                  {/* Offer (conditional) */}
                  {item.offer && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-green-600" strokeWidth={1.5} />
                      <span className="text-xs text-green-600 font-semibold">{item.offer}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">₹{item.price}</span>
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm cursor-not-allowed"
                  >
                    Login Required
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No items found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}