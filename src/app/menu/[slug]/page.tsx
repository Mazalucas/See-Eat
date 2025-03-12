'use client';

import { useEffect, useState } from 'react';
import { getMenuBySlug } from '@/lib/firebase/menuUtils';
import { RestaurantMenu, MenuCategory, MenuItem } from '@/lib/types/menu';
import Image from 'next/image';
import { FaUtensils } from 'react-icons/fa';

export default function MenuPage({ params }: { params: { slug: string } }) {
  const [menu, setMenu] = useState<RestaurantMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const menuData = await getMenuBySlug(params.slug);
        setMenu(menuData);
        if (menuData?.categories.length > 0) {
          setSelectedCategory(menuData.categories[0].id);
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <FaUtensils className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Menu Not Found</h1>
        <p className="text-gray-600">The menu you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const filteredItems = menu.items.filter(
    item => item.categoryId === selectedCategory && item.isAvailable
  );

  const renderMenuItem = (item: MenuItem) => (
    <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
      {item.image && menu.settings?.showImages && (
        <div className="relative h-48">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
          {menu.settings?.showPrices && (
            <span className="text-lg font-bold text-blue-600">
              ${item.price.toFixed(2)}
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
        {item.allergens && item.allergens.length > 0 && (
          <div className="text-xs text-gray-500">
            Allergens: {item.allergens.join(', ')}
          </div>
        )}
        {item.options && item.options.length > 0 && (
          <div className="mt-2">
            {item.options.map((option, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium">{option.name}: </span>
                {option.choices.map(choice => choice.name).join(', ')}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {menu.theme?.logoUrl ? (
              <Image
                src={menu.theme.logoUrl}
                alt="Restaurant logo"
                width={150}
                height={50}
                className="object-contain"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4">
            {menu.categories.map((category: MenuCategory) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(renderMenuItem)}
        </div>
      </div>
    </div>
  );
} 