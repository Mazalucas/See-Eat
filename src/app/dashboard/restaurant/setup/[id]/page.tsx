'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { RestaurantProfile } from '@/lib/types/auth';

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

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Halal',
  'Kosher',
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function RestaurantSetupPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    restaurantName: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    cuisine: [] as string[],
    dietaryOptions: [] as string[],
    openingHours: Object.fromEntries(
      DAYS.map(day => [day, { open: '09:00', close: '22:00' }])
    ),
  });

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const docRef = doc(db, 'users', id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().role === 'restaurant') {
          const data = docSnap.data() as RestaurantProfile;
          if (data.restaurantName) {
            setFormData({
              restaurantName: data.restaurantName,
              description: data.description,
              address: data.address,
              phone: data.phone,
              website: data.website || '',
              cuisine: data.cuisine,
              dietaryOptions: data.dietaryOptions,
              openingHours: data.openingHours,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching restaurant:', err);
        setError('Failed to load restaurant data');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await setDoc(
        doc(db, 'users', id as string),
        {
          ...formData,
          role: 'restaurant',
          isActive: true,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      router.push('/dashboard/restaurant');
    } catch (err) {
      console.error('Error saving restaurant:', err);
      setError('Failed to save restaurant information');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Restaurant Setup
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  id="restaurantName"
                  required
                  value={formData.restaurantName}
                  onChange={(e) =>
                    setFormData({ ...formData, restaurantName: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website (optional)
                </label>
                <input
                  type="url"
                  id="website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cuisine Types</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {CUISINES.map((cuisine) => (
                    <label key={cuisine} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.cuisine.includes(cuisine)}
                        onChange={(e) => {
                          const newCuisine = e.target.checked
                            ? [...formData.cuisine, cuisine]
                            : formData.cuisine.filter((c) => c !== cuisine);
                          setFormData({ ...formData, cuisine: newCuisine });
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{cuisine}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dietary Options
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {DIETARY_OPTIONS.map((option) => (
                    <label key={option} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.dietaryOptions.includes(option)}
                        onChange={(e) => {
                          const newOptions = e.target.checked
                            ? [...formData.dietaryOptions, option]
                            : formData.dietaryOptions.filter((o) => o !== option);
                          setFormData({ ...formData, dietaryOptions: newOptions });
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opening Hours
                </label>
                <div className="space-y-3">
                  {DAYS.map((day) => (
                    <div key={day} className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 capitalize">
                          {day}
                        </label>
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="time"
                          value={formData.openingHours[day].open}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              openingHours: {
                                ...formData.openingHours,
                                [day]: {
                                  ...formData.openingHours[day],
                                  open: e.target.value,
                                },
                              },
                            })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="time"
                          value={formData.openingHours[day].close}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              openingHours: {
                                ...formData.openingHours,
                                [day]: {
                                  ...formData.openingHours[day],
                                  close: e.target.value,
                                },
                              },
                            })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5">
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {saving ? 'Saving...' : 'Save and Continue'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 