'use client';

import { useState, useMemo } from 'react';
import { MenuItem as MenuItemType } from '@/lib/types/auth';
import MenuItem from './MenuItem';

interface MenuGridProps {
  items: MenuItemType[];
  onFavorite?: (itemId: string) => void;
  favoritedItems?: string[];
}

type FilterType = {
  category: string;
  dietary: string[];
  priceRange: string;
  searchQuery: string;
};

export default function MenuGrid({ items, onFavorite, favoritedItems = [] }: MenuGridProps) {
  const [filters, setFilters] = useState<FilterType>({
    category: 'all',
    dietary: [],
    priceRange: 'all',
    searchQuery: '',
  });

  // Extract unique categories from items
  const categories = useMemo(() => {
    const cats = new Set(items.map((item) => item.category));
    return ['all', ...Array.from(cats)];
  }, [items]);

  // Extract unique dietary info from items
  const dietaryOptions = useMemo(() => {
    const dietary = new Set(items.flatMap((item) => item.dietaryInfo));
    return Array.from(dietary);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (filters.category !== 'all' && item.category !== filters.category) {
        return false;
      }

      // Dietary filter
      if (
        filters.dietary.length > 0 &&
        !filters.dietary.every((diet) => item.dietaryInfo.includes(diet))
      ) {
        return false;
      }

      // Price range filter
      if (filters.priceRange !== 'all') {
        const [min, max] = filters.priceRange.split('-').map(Number);
        if (item.price < min || (max && item.price > max)) {
          return false;
        }
      }

      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [items, filters]);

  const handleDietaryChange = (diet: string) => {
    setFilters((prev) => ({
      ...prev,
      dietary: prev.dietary.includes(diet)
        ? prev.dietary.filter((d) => d !== diet)
        : [...prev.dietary, diet],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search menu..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.searchQuery}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
            />
          </div>

          {/* Category filter */}
          <div>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value }))
              }
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Price range filter */}
          <div>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.priceRange}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, priceRange: e.target.value }))
              }
            >
              <option value="all">All Prices</option>
              <option value="0-10">Under $10</option>
              <option value="10-20">$10 - $20</option>
              <option value="20-30">$20 - $30</option>
              <option value="30">$30+</option>
            </select>
          </div>
        </div>

        {/* Dietary filters */}
        <div className="flex flex-wrap gap-2">
          {dietaryOptions.map((diet) => (
            <button
              key={diet}
              onClick={() => handleDietaryChange(diet)}
              className={`px-3 py-1 rounded-full text-sm ${
                filters.dietary.includes(diet)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {diet}
            </button>
          ))}
        </div>
      </div>

      {/* Menu grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            onFavorite={onFavorite}
            isFavorited={favoritedItems.includes(item.id)}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No items found matching your filters.
          </p>
        </div>
      )}
    </div>
  );
} 