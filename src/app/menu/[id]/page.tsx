'use client';

import { useEffect, useState } from 'react';
import { getMenuByRestaurantId } from '@/lib/firebase/menuUtils';
import { RestaurantMenu, MenuCategory, MenuItem, Allergen, DietaryTag } from '@/lib/types/menu';
import Image from 'next/image';
import { FaUtensils } from 'react-icons/fa';

// Default menu categories
const DEFAULT_CATEGORIES: MenuCategory[] = [
  { id: 'starters', name: 'Entrantes', order: 1 },
  { id: 'main-courses', name: 'Platos Principales', order: 2 },
  { id: 'pasta', name: 'Pasta', order: 3 },
  { id: 'pizza', name: 'Pizza', order: 4 },
  { id: 'salads', name: 'Ensaladas', order: 5 },
  { id: 'desserts', name: 'Postres', order: 6 },
  { id: 'beverages', name: 'Bebidas', order: 7 }
];

// Default menu items
const DEFAULT_ITEMS: MenuItem[] = [
  {
    id: 'bruschetta',
    name: 'Bruschetta Clásica',
    description: 'Pan tostado con ajo, tomates, albahaca y aceite de oliva extra virgen',
    price: 8.99,
    categoryId: 'starters',
    image: '/images/menu-items/bruschetta-main.jpg',
    ingredients: [],
    allergens: ['Wheat', 'Gluten'] as Allergen[],
    dietaryTags: ['Vegetarian', 'Dairy-Free', 'Nut-Free'] as DietaryTag[],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'caprese-salad',
    name: 'Ensalada Caprese',
    description: 'Mozzarella fresca, tomates y albahaca con reducción de balsámico',
    price: 10.99,
    categoryId: 'salads',
    image: '/images/menu-items/bruschetta-main.jpg',
    ingredients: [],
    allergens: ['Dairy'] as Allergen[],
    dietaryTags: ['Vegetarian', 'Gluten-Free', 'Nut-Free'] as DietaryTag[],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'margherita-pizza',
    name: 'Pizza Margherita',
    description: 'Pizza clásica con salsa de tomate, mozzarella fresca y albahaca',
    price: 14.99,
    categoryId: 'pizza',
    image: '/images/menu-items/bruschetta-main.jpg',
    ingredients: [],
    allergens: ['Wheat', 'Dairy', 'Gluten'] as Allergen[],
    dietaryTags: ['Vegetarian'] as DietaryTag[],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function MenuPage({ params }: { params: { id: string } }) {
  const [menu, setMenu] = useState<RestaurantMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const menuData = await getMenuByRestaurantId(params.id);
        if (menuData) {
          setMenu(menuData);
          if (menuData.categories && menuData.categories.length > 0) {
            setSelectedCategory(menuData.categories[0].id);
          }
        } else {
          // Create a default menu if none exists
          const defaultMenu: RestaurantMenu = {
            id: `menu-${params.id}`,
            restaurantId: params.id,
            name: 'Nuestro Menú',
            description: 'Una selección de nuestros mejores platos',
            categories: DEFAULT_CATEGORIES,
            items: DEFAULT_ITEMS,
            settings: {
              showPrices: true,
              showImages: true,
              showAllergens: true,
              currency: 'EUR'
            },
            theme: {
              primaryColor: '#8B0000',
              secondaryColor: '#006400',
              fontFamily: 'Playfair Display'
            },
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          setMenu(defaultMenu);
          setSelectedCategory(DEFAULT_CATEGORIES[0].id);
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [params.id]);

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Menú no encontrado</h1>
        <p className="text-gray-600">El menú que buscas no existe o ha sido eliminado.</p>
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
            Alérgenos: {item.allergens.join(', ')}
          </div>
        )}
        {item.dietaryTags && item.dietaryTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.dietaryTags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
              >
                {tag}
              </span>
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
            <h1 className="text-2xl font-bold text-gray-900">{menu.name}</h1>
          </div>
          {menu.description && (
            <p className="mt-2 text-gray-600">{menu.description}</p>
          )}
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