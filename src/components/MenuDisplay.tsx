'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Menu, MenuItem, Allergen, DietaryTag } from '@/lib/types/menu';
import MenuFilters from './MenuFilters';

interface MenuDisplayProps {
  menu: Menu;
}

export default function MenuDisplay({ menu }: MenuDisplayProps) {
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>(menu.items);

  const handleFilterChange = ({
    selectedCategory,
    selectedAllergens,
    selectedDietaryTags,
    spicyLevel,
  }: {
    selectedCategory: string;
    selectedAllergens: Allergen[];
    selectedDietaryTags: DietaryTag[];
    spicyLevel: number | null;
  }) => {
    let filtered = menu.items;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.categoryId === selectedCategory);
    }

    // Filter out items with selected allergens
    if (selectedAllergens.length > 0) {
      filtered = filtered.filter(item =>
        !selectedAllergens.some(allergen => item.allergens.includes(allergen))
      );
    }

    // Filter by dietary tags (all selected tags must be satisfied)
    if (selectedDietaryTags.length > 0) {
      filtered = filtered.filter(item =>
        selectedDietaryTags.every(tag => item.dietaryTags.includes(tag))
      );
    }

    // Filter by spicy level
    if (spicyLevel !== null) {
      filtered = filtered.filter(item => item.spicyLevel === spicyLevel);
    }

    // Sort by category order and then item order
    filtered.sort((a, b) => {
      const categoryA = menu.categories.find(c => c.id === a.categoryId);
      const categoryB = menu.categories.find(c => c.id === b.categoryId);
      if (categoryA?.order !== categoryB?.order) {
        return (categoryA?.order || 0) - (categoryB?.order || 0);
      }
      return a.order - b.order;
    });

    setFilteredItems(filtered);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MenuFilters
        categories={menu.categories}
        onFilterChange={handleFilterChange}
      />

      <div className="space-y-8">
        {menu.categories.map(category => {
          const categoryItems = filteredItems.filter(
            item => item.categoryId === category.id
          );

          if (categoryItems.length === 0) return null;

          return (
            <div key={category.id} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
              {category.description && (
                <p className="text-gray-600 mb-4">{category.description}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categoryItems.map(item => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    {item.imageUrl && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <div className="flex items-center">
                          {item.spicyLevel && (
                            <span className="text-lg mr-2">
                              {'🌶️'.repeat(item.spicyLevel)}
                            </span>
                          )}
                          <span className="font-semibold text-green-600">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-3">{item.description}</p>

                      {/* Dietary Tags */}
                      {item.dietaryTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {item.dietaryTags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Allergens Warning */}
                      {item.allergens.length > 0 && (
                        <div className="mt-2 text-sm">
                          <span className="text-red-600 font-semibold">
                            Contains:
                          </span>{' '}
                          {item.allergens.join(', ')}
                        </div>
                      )}

                      {/* Availability Status */}
                      {!item.isAvailable && (
                        <div className="mt-2 text-sm text-red-600">
                          Currently unavailable
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No items match your selected filters. Try adjusting your criteria.
          </p>
        </div>
      )}
    </div>
  );
} 