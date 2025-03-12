'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { RestaurantProfile } from '@/lib/types/auth';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { FaStar, FaFilter, FaUtensils, FaClock } from 'react-icons/fa';

const CUISINES = [
  'Italian',
  'Japanese',
  'Mexican',
  'Indian',
  'Chinese',
  'Thai',
  'Mediterranean',
  'American',
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialCuisine = searchParams.get('cuisine') || '';

  const [restaurants, setRestaurants] = useState<RestaurantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    cuisine: initialCuisine,
    priceRange: 'all',
    sortBy: 'newest',
    searchTerm: '',
  });

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        let restaurantsQuery = query(
          collection(db, 'restaurants'),
          where('isActive', '==', true)
        );

        if (filters.cuisine) {
          restaurantsQuery = query(
            restaurantsQuery,
            where('cuisine', 'array-contains', filters.cuisine)
          );
        }

        const snapshot = await getDocs(restaurantsQuery);
        let restaurants = snapshot.docs.map(
          (doc) => ({ ...doc.data(), uid: doc.id } as RestaurantProfile)
        );

        // Apply client-side filters
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          restaurants = restaurants.filter(
            (restaurant) =>
              restaurant.restaurantName.toLowerCase().includes(searchLower) ||
              restaurant.description.toLowerCase().includes(searchLower) ||
              restaurant.address.toLowerCase().includes(searchLower)
          );
        }

        // Sort results
        switch (filters.sortBy) {
          case 'newest':
            restaurants.sort(
              (a, b) =>
                b.createdAt.getTime() - a.createdAt.getTime()
            );
            break;
          case 'name':
            restaurants.sort((a, b) =>
              a.restaurantName.localeCompare(b.restaurantName)
            );
            break;
          default:
            break;
        }

        setRestaurants(restaurants);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Search Restaurants
        </h1>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) =>
                setFilters({ ...filters, searchTerm: e.target.value })
              }
              placeholder="Search by name, description, or location..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={filters.cuisine}
              onChange={(e) =>
                setFilters({ ...filters, cuisine: e.target.value })
              }
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Cuisines</option>
              {CUISINES.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-200" />
              <div className="p-6 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : restaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.uid}
              href={`/restaurant/${restaurant.uid}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-48">
                <Image
                  src={restaurant.photoURL || '/images/default-restaurant.jpg'}
                  alt={restaurant.restaurantName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {restaurant.restaurantName}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {restaurant.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {restaurant.cuisine.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {type}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <FaUtensils className="w-4 h-4" />
                    <span>{restaurant.cuisine[0]}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaClock className="w-4 h-4" />
                    <span>
                      {Object.keys(restaurant.openingHours).length} days
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FaUtensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No restaurants found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filters to find what you're looking for
          </p>
        </div>
      )}
    </div>
  );
} 