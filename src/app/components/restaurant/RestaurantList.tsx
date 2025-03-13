'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserRestaurants } from '@/lib/firebase/restaurantUtils';
import { RestaurantProfile } from '@/lib/types/auth';
import { FaPlus, FaEdit, FaStore } from 'react-icons/fa';

export default function RestaurantList() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<RestaurantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRestaurants = async () => {
      if (!user) {
        console.log('No user found, skipping restaurant fetch');
        return;
      }
      
      console.log('Loading restaurants for user:', user.uid);
      try {
        const userRestaurants = await getUserRestaurants(user.uid);
        console.log('Loaded restaurants:', userRestaurants);
        setRestaurants(userRestaurants);
      } catch (err) {
        console.error('Error loading restaurants:', err);
        setError('Error al cargar los restaurantes');
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, [user]);

  console.log('Current state:', { loading, error, restaurantsCount: restaurants.length });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mis Restaurantes</h2>
        <Link
          href="/restaurant/setup"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <FaPlus className="mr-2" />
          Nuevo Restaurante
        </Link>
      </div>

      {restaurants.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaStore className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay restaurantes</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza creando tu primer restaurante
          </p>
          <div className="mt-6">
            <Link
              href="/restaurant/setup"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <FaPlus className="mr-2" />
              Nuevo Restaurante
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.uid}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {restaurant.restaurantName}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    restaurant.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {restaurant.status === 'active' ? 'Activo' : 'Pendiente'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {restaurant.address?.street}, {restaurant.address?.city}
                </p>
                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/restaurant/manage/${restaurant.uid}`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FaEdit className="mr-2" />
                    Gestionar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 