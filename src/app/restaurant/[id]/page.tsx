'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { RestaurantProfile } from '@/lib/types/auth';
import { MenuItem } from '@/lib/types/menu';
import Image from 'next/image';
import { FaStar, FaClock, FaMapMarkerAlt, FaPhone, FaGlobe, FaUtensils, FaExternalLinkAlt } from 'react-icons/fa';
import MenuDisplay from '@/components/menu/MenuDisplay';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Link from 'next/link';

export default function RestaurantPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu');

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        if (!id) return;

        // Fetch restaurant details
        const restaurantDoc = await getDoc(doc(db, 'restaurants', id as string));
        if (restaurantDoc.exists()) {
          setRestaurant({ ...restaurantDoc.data(), uid: restaurantDoc.id } as RestaurantProfile);
        }

        // Fetch menu items
        const menuQuery = query(
          collection(db, 'menuItems'),
          where('restaurantId', '==', id)
        );
        const menuSnapshot = await getDocs(menuQuery);
        const items = menuSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as MenuItem[];
        setMenuItems(items);
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg mb-8" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Restaurant not found</h1>
        <p className="mt-2 text-gray-600">The restaurant you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const formatOpeningHours = (hours: Record<string, { open: string; close: string }>) => {
    return Object.entries(hours).map(([day, time]) => (
      <div key={day} className="flex justify-between">
        <span className="font-medium">{day}</span>
        <span>{time.open} - {time.close}</span>
      </div>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8">
        <Image
          src={restaurant.photoURL || '/images/default-restaurant.jpg'}
          alt={restaurant.restaurantName}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {restaurant.restaurantName}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FaMapMarkerAlt className="w-4 h-4 mr-2" />
              <span>{restaurant.address}</span>
            </div>
            {restaurant.phone && (
              <div className="flex items-center">
                <FaPhone className="w-4 h-4 mr-2" />
                <span>{restaurant.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('menu')}
            className={`${
              activeTab === 'menu'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Menu
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Information
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'menu' ? (
        <MenuDisplay menuItems={menuItems} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className="text-gray-600 mb-6">{restaurant.description}</p>
            
            <h2 className="text-xl font-semibold mb-4">Cuisine</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {restaurant.cuisine.map((type) => (
                <span
                  key={type}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {type}
                </span>
              ))}
            </div>

            {restaurant.website && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Website</h2>
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <FaGlobe className="w-4 h-4 mr-2" />
                  {restaurant.website}
                </a>
              </div>
            )}

            {menuItems.length > 0 && (
              <div className="mt-6">
                <Link
                  href={`/menu/${menuItems[0].slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Menu <FaExternalLinkAlt className="ml-2 h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Opening Hours</h2>
            <div className="bg-gray-50 rounded-lg p-6 space-y-2">
              {formatOpeningHours(restaurant.openingHours)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 