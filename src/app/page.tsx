'use client';

import { useState, useEffect } from 'react';
import { RestaurantProfile } from '@/lib/types/auth';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { FaSearch, FaUtensils, FaClock } from 'react-icons/fa';

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
  const [featuredRestaurants, setFeaturedRestaurants] = useState<RestaurantProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const restaurantsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'restaurant'),
          where('isActive', '==', true),
          orderBy('createdAt', 'desc'),
          limit(6)
        );

        const snapshot = await getDocs(restaurantsQuery);
        const restaurants = snapshot.docs.map(doc => ({
          ...doc.data(),
          uid: doc.id,
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as RestaurantProfile[];

        setFeaturedRestaurants(restaurants);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const filteredRestaurants = featuredRestaurants.filter(restaurant =>
    restaurant.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine.some(type => type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-gray-900">
        <Image
          src="/images/hero-bg.jpg"
          alt="Restaurant background"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
            Discover Amazing Restaurants
          </h1>
          <p className="text-xl md:text-2xl text-center mb-8 max-w-2xl">
            Find the best local restaurants, explore menus, and make informed dining decisions
          </p>
          <div className="w-full max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search restaurants by name, cuisine, or location..."
                className="w-full px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Restaurants */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Restaurants</h2>
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
        ) : filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map((restaurant) => (
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
              Try adjusting your search to find what you're looking for
            </p>
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse by Cuisine</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        </div>
      </section>
    </main>
  );
}
