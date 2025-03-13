'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SearchBar from '@/components/SearchBar';
import { DietaryTag } from '@/lib/types/auth';
import { RestaurantProfile } from '@/lib/types/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

export default function RestaurantsPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<RestaurantProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async ({
    searchTerm,
    cuisine,
    dietaryTags,
  }: {
    searchTerm: string;
    cuisine: string;
    dietaryTags: DietaryTag[];
  }) => {
    setLoading(true);
    setError('');

    try {
      const restaurantsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'restaurant'),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(restaurantsQuery);
      const allRestaurants = snapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id,
      })) as RestaurantProfile[];
      
      let filteredRestaurants = allRestaurants;

      // Apply search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredRestaurants = filteredRestaurants.filter(
          (restaurant) =>
            restaurant.restaurantName?.toLowerCase().includes(searchLower) ||
            restaurant.description?.toLowerCase().includes(searchLower)
        );
      }

      // Apply cuisine filter
      if (cuisine) {
        filteredRestaurants = filteredRestaurants.filter(
          (restaurant) => restaurant.cuisine && restaurant.cuisine[0]?.toLowerCase() === cuisine.toLowerCase()
        );
      }

      // Apply dietary tags filter
      if (dietaryTags.length > 0) {
        filteredRestaurants = filteredRestaurants.filter((restaurant) =>
          dietaryTags.every((tag) => restaurant.dietaryOptions?.includes(tag))
        );
      }

      setRestaurants(filteredRestaurants);
    } catch (err) {
      console.error('Error searching restaurants:', err);
      setError('Failed to search restaurants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find Restaurants
          </h1>
          <SearchBar
            onSearch={handleSearch}
            className="bg-white p-4 rounded-lg shadow-lg"
          />
        </div>

        {/* Results Section */}
        <section>
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Searching restaurants...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.uid}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/restaurant/${restaurant.uid}`)}
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={restaurant.photoURL || '/images/default-restaurant.jpg'}
                      alt={restaurant.restaurantName || 'Restaurant'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">
                      {restaurant.restaurantName}
                    </h3>
                    <p className="text-gray-600 mb-4">{restaurant.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {restaurant.dietaryOptions?.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {restaurant.cuisine && (
                      <div className="mt-4 text-sm text-gray-500">
                        Cuisine: {restaurant.cuisine[0]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600">
              No restaurants found. Try adjusting your search criteria.
            </div>
          )}
        </section>
      </div>
    </main>
  );
} 