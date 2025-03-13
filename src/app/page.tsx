'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SearchBar from '@/components/SearchBar';
import { DietaryTag } from '@/lib/types/auth';
import { RestaurantProfile } from '@/lib/types/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import Link from 'next/link';
import { FaUtensils, FaClock } from 'react-icons/fa';

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

export default function HomePage() {
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
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh]">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Restaurant background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>
        
        <div className="relative h-full container mx-auto px-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Find Your Perfect Dining Experience
              </h1>
              <p className="text-xl text-white opacity-90">
                Discover restaurants that cater to your dietary preferences
              </p>
            </div>
            
            <div className="w-full max-w-4xl">
              <SearchBar
                onSearch={handleSearch}
                className="bg-white/95 backdrop-blur p-4 rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="container mx-auto px-4 py-12">
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
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

      {/* Featured Restaurants */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Restaurants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CUISINES.map((cuisine) => (
            <Link
              key={cuisine}
              href={`/search?cuisine=${cuisine.toLowerCase()}`}
              className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow duration-300"
            >
              <FaUtensils className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <span className="text-gray-900 font-medium">{cuisine}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
