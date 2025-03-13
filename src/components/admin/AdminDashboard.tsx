'use client';

import { useState, useEffect } from 'react';
import { UserProfile, RestaurantProfile } from '@/lib/types/auth';
import { FaUser, FaStore, FaBan, FaCheck } from 'react-icons/fa';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

interface AdminDashboardProps {
  adminId: string;
}

export default function AdminDashboard({ adminId }: AdminDashboardProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'restaurants'>('users');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersQuery = query(
          collection(db, 'users'),
          where('role', '!=', 'admin'),
          orderBy('role'),
          orderBy('createdAt', 'desc')
        );
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map(
          (doc) => ({ ...doc.data(), uid: doc.id } as UserProfile)
        );

        // Fetch restaurants
        const restaurantsQuery = query(
          collection(db, 'restaurants'),
          orderBy('createdAt', 'desc')
        );
        const restaurantsSnapshot = await getDocs(restaurantsQuery);
        const restaurantsData = restaurantsSnapshot.docs.map(
          (doc) => ({ ...doc.data(), uid: doc.id } as RestaurantProfile)
        );

        setUsers(usersData);
        setRestaurants(restaurantsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRestaurants = restaurants.filter((restaurant) =>
    restaurant.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleRestaurantStatus = async (restaurantId: string) => {
    try {
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      const restaurant = restaurants.find((r) => r.uid === restaurantId);
      if (restaurant) {
        await updateDoc(restaurantRef, {
          isActive: !restaurant.isActive,
        });
        setRestaurants(
          restaurants.map((r) =>
            r.uid === restaurantId ? { ...r, isActive: !r.isActive } : r
          )
        );
      }
    } catch (error) {
      console.error('Error updating restaurant status:', error);
      alert('Error updating restaurant status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage users and restaurants from one place
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <FaUser />
            <span>Users</span>
          </button>
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`${
              activeTab === 'restaurants'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <FaStore />
            <span>Restaurants</span>
          </button>
        </nav>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Content */}
      {activeTab === 'users' ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <li key={user.uid}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img
                          className="h-12 w-12 rounded-full"
                          src={user.photoURL || '/images/default-avatar.jpg'}
                          alt={user.displayName || 'User'}
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {user.displayName || 'Unnamed User'}
                        </h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'restaurant'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredRestaurants.map((restaurant) => (
              <li key={restaurant.uid}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {restaurant.restaurantName}
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {restaurant.address}
                        </p>
                        <p className="text-sm text-gray-500">
                          {restaurant.phone}
                        </p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {restaurant.cuisine.map((type) => (
                          <span
                            key={type}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          restaurant.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {restaurant.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() =>
                          handleToggleRestaurantStatus(restaurant.uid)
                        }
                        className={`p-2 rounded-full ${
                          restaurant.isActive
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {restaurant.isActive ? <FaBan /> : <FaCheck />}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 