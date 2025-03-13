'use client';

import { useState } from 'react';
import { Allergen, DietaryTag, MenuCategory } from '@/lib/types/menu';

interface MenuFiltersProps {
  categories: MenuCategory[];
  onFilterChange: (filters: {
    selectedCategory: string;
    selectedAllergens: Allergen[];
    selectedDietaryTags: DietaryTag[];
    spicyLevel: number | null;
  }) => void;
}

const ALLERGENS: Allergen[] = [
  'Dairy',
  'Eggs',
  'Fish',
  'Shellfish',
  'Tree Nuts',
  'Peanuts',
  'Wheat',
  'Soy',
  'Sesame',
  'Gluten',
  'Mustard',
  'Celery',
  'Lupin',
  'Molluscs',
  'Sulphites',
];

const DIETARY_TAGS: DietaryTag[] = [
  'Vegetarian',
  'Vegan',
  'Halal',
  'Kosher',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Low-Carb',
  'Keto',
  'Paleo',
];

export default function MenuFilters({ categories, onFilterChange }: MenuFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAllergens, setSelectedAllergens] = useState<Allergen[]>([]);
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<DietaryTag[]>([]);
  const [spicyLevel, setSpicyLevel] = useState<number | null>(null);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    updateFilters(categoryId, selectedAllergens, selectedDietaryTags, spicyLevel);
  };

  const toggleAllergen = (allergen: Allergen) => {
    const newAllergens = selectedAllergens.includes(allergen)
      ? selectedAllergens.filter(a => a !== allergen)
      : [...selectedAllergens, allergen];
    setSelectedAllergens(newAllergens);
    updateFilters(selectedCategory, newAllergens, selectedDietaryTags, spicyLevel);
  };

  const toggleDietaryTag = (tag: DietaryTag) => {
    const newTags = selectedDietaryTags.includes(tag)
      ? selectedDietaryTags.filter(t => t !== tag)
      : [...selectedDietaryTags, tag];
    setSelectedDietaryTags(newTags);
    updateFilters(selectedCategory, selectedAllergens, newTags, spicyLevel);
  };

  const handleSpicyLevelChange = (level: number | null) => {
    setSpicyLevel(level);
    updateFilters(selectedCategory, selectedAllergens, selectedDietaryTags, level);
  };

  const updateFilters = (
    category: string,
    allergens: Allergen[],
    dietaryTags: DietaryTag[],
    spicyLevel: number | null
  ) => {
    onFilterChange({
      selectedCategory: category,
      selectedAllergens: allergens,
      selectedDietaryTags: dietaryTags,
      spicyLevel,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="space-y-6">
        {/* Categories */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Categories</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Preferences */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Dietary Preferences</h3>
          <div className="flex flex-wrap gap-2">
            {DIETARY_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleDietaryTag(tag)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedDietaryTags.includes(tag)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Allergens to Exclude */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Allergens to Exclude</h3>
          <div className="flex flex-wrap gap-2">
            {ALLERGENS.map((allergen) => (
              <button
                key={allergen}
                onClick={() => toggleAllergen(allergen)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedAllergens.includes(allergen)
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {allergen}
              </button>
            ))}
          </div>
        </div>

        {/* Spicy Level */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Spicy Level</h3>
          <div className="flex gap-2">
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                onClick={() => handleSpicyLevelChange(spicyLevel === level ? null : level)}
                className={`px-4 py-2 rounded ${
                  spicyLevel === level
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level === 1 ? '🌶️' : level === 2 ? '🌶️🌶️' : '🌶️🌶️🌶️'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Filters Summary */}
      {(selectedAllergens.length > 0 || selectedDietaryTags.length > 0) && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {selectedDietaryTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center"
              >
                {tag}
                <button
                  onClick={() => toggleDietaryTag(tag)}
                  className="ml-1 hover:text-green-600"
                >
                  ×
                </button>
              </span>
            ))}
            {selectedAllergens.map((allergen) => (
              <span
                key={allergen}
                className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center"
              >
                No {allergen}
                <button
                  onClick={() => toggleAllergen(allergen)}
                  className="ml-1 hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 