import { useState, useMemo } from 'react';
import Image from 'next/image';
import { MenuItem } from '@/lib/types/menu';
import { FaSearch } from 'react-icons/fa';

interface MenuDisplayProps {
  menuItems: MenuItem[];
}

export default function MenuDisplay({ menuItems }: MenuDisplayProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Group menu items by category
  const categorizedItems = useMemo(() => {
    const filtered = menuItems.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [menuItems, searchTerm]);

  // Get unique categories
  const categories = useMemo(() => {
    return ['all', ...Object.keys(categorizedItems)].filter(
      (category) => category !== 'Uncategorized'
    );
  }, [categorizedItems]);

  // Filter items by selected category
  const displayedItems = useMemo(() => {
    if (selectedCategory === 'all') {
      return categorizedItems;
    }
    return {
      [selectedCategory]: categorizedItems[selectedCategory] || [],
    };
  }, [categorizedItems, selectedCategory]);

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No menu items available
        </h3>
        <p className="text-gray-500">
          This restaurant hasn't added any menu items yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search menu items..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-8">
        {Object.entries(displayedItems).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-2xl font-semibold mb-4 capitalize">
              {category === 'Uncategorized' ? 'Other Items' : category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex space-x-4 bg-white rounded-lg shadow-sm p-4"
                >
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.imageUrl || '/images/default-food.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.name}
                      </h3>
                      <span className="text-lg font-semibold text-blue-600">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                      {item.description}
                    </p>
                    {item.dietaryInfo && item.dietaryInfo.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.dietaryInfo.map((info) => (
                          <span
                            key={info}
                            className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                          >
                            {info}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 