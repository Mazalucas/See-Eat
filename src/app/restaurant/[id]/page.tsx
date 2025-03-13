'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { RestaurantProfile } from '@/lib/types/auth';
import { Menu } from '@/lib/types/menu';
import { getMenu } from '@/lib/firebase/menuUtils';

export default function RestaurantPage() {
  const { id } = useParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null);
  const [hasMenu, setHasMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRestaurantAndCheckMenu = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch restaurant data
        const restaurantDoc = await getDoc(doc(db, 'users', id as string));
        if (!restaurantDoc.exists()) {
          setError('Restaurant not found');
          return;
        }

        const restaurantData = {
          ...restaurantDoc.data(),
          uid: restaurantDoc.id,
        } as RestaurantProfile;

        setRestaurant(restaurantData);

        // Check if menu exists
        const menuData = await getMenu(id as string);
        setHasMenu(!!menuData);
      } catch (err) {
        console.error('Error fetching restaurant:', err);
        setError('Failed to load restaurant information');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurantAndCheckMenu();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error || 'Restaurant not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <div className="relative h-[40vh] bg-gray-900">
        <Image
          src={restaurant.photoURL || '/images/default-restaurant.jpg'}
          alt={restaurant.restaurantName}
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              {restaurant.restaurantName}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              {restaurant.description}
            </p>
          </div>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Address */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
              <p className="text-gray-600">{restaurant.address}</p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
              <p className="text-gray-600">{restaurant.phone}</p>
              {restaurant.website && (
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Visit Website
                </a>
              )}
            </div>

            {/* Hours */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Hours</h3>
              {restaurant.openingHours ? (
                <div className="space-y-1">
                  {Object.entries(restaurant.openingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{day}</span>
                      <span className="text-gray-900">
                        {hours.open} - {hours.close}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Hours not available</p>
              )}
            </div>
          </div>

          {/* Dietary Options */}
          {restaurant.dietaryOptions && restaurant.dietaryOptions.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-3">
                Dietary Options Available
              </h3>
              <div className="flex flex-wrap gap-2">
                {restaurant.dietaryOptions.map((option) => (
                  <span
                    key={option}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {option}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* View Menu Button */}
          <div className="mt-6 pt-6 border-t text-center">
            <button
              onClick={() => window.open(`/menu/${restaurant.uid}`, '_blank', 'noopener,noreferrer')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ver Menú
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 