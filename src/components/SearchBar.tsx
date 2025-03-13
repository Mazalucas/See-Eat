'use client';

import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { DietaryTag } from '@/lib/types/auth';

const CUISINES = [
  'All',
  'Italian',
  'Japanese',
  'Mexican',
  'Indian',
  'Chinese',
  'Thai',
  'Mediterranean',
  'American',
];

const DIETARY_OPTIONS: DietaryTag[] = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Lactose-Free',
  'Kosher',
  'Halal',
];

interface SearchBarProps {
  onSearch: (params: {
    searchTerm: string;
    cuisine: string;
    dietaryTags: DietaryTag[];
  }) => void;
  className?: string;
}

export default function SearchBar({ onSearch, className = '' }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<DietaryTag[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      searchTerm,
      cuisine: selectedCuisine === 'All' ? '' : selectedCuisine,
      dietaryTags: selectedDietaryTags,
    });
  };

  const toggleDietaryTag = (tag: DietaryTag) => {
    setSelectedDietaryTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <form onSubmit={handleSearch} className={`w-full ${className}`}>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search restaurants..."
            className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Cuisine Filter */}
        <select
          value={selectedCuisine}
          onChange={(e) => setSelectedCuisine(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
        >
          {CUISINES.map((cuisine) => (
            <option key={cuisine} value={cuisine}>
              {cuisine} Cuisine
            </option>
          ))}
        </select>

        {/* Dietary Options Dropdown */}
        <div className="relative group">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-900 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            Dietary Options ({selectedDietaryTags.length})
          </button>
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="p-2">
              {DIETARY_OPTIONS.map((tag) => (
                <label
                  key={tag}
                  className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedDietaryTags.includes(tag)}
                    onChange={() => toggleDietaryTag(tag)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">{tag}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search
        </button>
      </div>

      {/* Selected Tags */}
      {selectedDietaryTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedDietaryTags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center"
            >
              {tag}
              <button
                type="button"
                onClick={() => toggleDietaryTag(tag)}
                className="ml-1 hover:text-blue-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </form>
  );
} 