'use client';

import { useState } from 'react';
import { RestaurantProfile } from '@/lib/types/auth';
import { updateRestaurantProfile, uploadMenuImage } from '@/lib/firebase/firebaseUtils';
import Image from 'next/image';
import { FaCamera } from 'react-icons/fa';

interface RestaurantProfileManagerProps {
  restaurantId: string;
  initialProfile: RestaurantProfile;
}

interface ProfileFormData {
  restaurantName: string;
  description: string;
  address: string;
  phone: string;
  cuisine: string[];
  openingHours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  features: string[];
  isActive: boolean;
}

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function RestaurantProfileManager({
  restaurantId,
  initialProfile,
}: RestaurantProfileManagerProps) {
  const [profile, setProfile] = useState<RestaurantProfile>(initialProfile);
  const [formData, setFormData] = useState<ProfileFormData>({
    restaurantName: initialProfile.restaurantName,
    description: initialProfile.description,
    address: initialProfile.address,
    phone: initialProfile.phone,
    cuisine: initialProfile.cuisine,
    openingHours: initialProfile.openingHours,
    features: initialProfile.features,
    isActive: initialProfile.isActive,
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (files: FileList | null) => {
    if (files && files[0]) {
      setCoverImage(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let photoURL = profile.photoURL;

      if (coverImage) {
        photoURL = await uploadMenuImage(coverImage, restaurantId, 'profile');
      }

      const updatedProfile = {
        ...formData,
        photoURL,
      };

      await updateRestaurantProfile(restaurantId, updatedProfile);
      setProfile({ ...profile, ...updatedProfile });
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCuisineInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (value && !formData.cuisine.includes(value)) {
        setFormData({ ...formData, cuisine: [...formData.cuisine, value] });
        e.currentTarget.value = '';
      }
    }
  };

  const handleFeatureInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (value && !formData.features.includes(value)) {
        setFormData({ ...formData, features: [...formData.features, value] });
        e.currentTarget.value = '';
      }
    }
  };

  const updateOpeningHours = (
    day: string,
    type: 'open' | 'close',
    value: string
  ) => {
    setFormData({
      ...formData,
      openingHours: {
        ...formData.openingHours,
        [day]: {
          ...formData.openingHours[day],
          [type]: value,
        },
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-semibold mb-6">Restaurant Profile</h2>

          {/* Cover Image */}
          <div className="relative">
            <div className="relative h-64 w-full rounded-lg overflow-hidden">
              {profile.photoURL ? (
                <Image
                  src={profile.photoURL}
                  alt={profile.restaurantName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                  <FaCamera className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="absolute bottom-4 right-4">
              <label className="cursor-pointer bg-white rounded-full p-2 shadow-lg hover:bg-gray-50">
                <FaCamera className="w-6 h-6 text-gray-600" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Restaurant Name
              </label>
              <input
                type="text"
                required
                value={formData.restaurantName}
                onChange={(e) =>
                  setFormData({ ...formData, restaurantName: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Cuisine Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cuisine Types (Press Enter to add)
            </label>
            <input
              type="text"
              onKeyDown={handleCuisineInput}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.cuisine.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {type}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        cuisine: formData.cuisine.filter((t) => t !== type),
                      })
                    }
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opening Hours
            </label>
            <div className="space-y-2">
              {DAYS.map((day) => (
                <div key={day} className="flex items-center space-x-4">
                  <span className="w-24 text-sm font-medium text-gray-700">
                    {day}
                  </span>
                  <input
                    type="time"
                    value={formData.openingHours[day]?.open || ''}
                    onChange={(e) =>
                      updateOpeningHours(day, 'open', e.target.value)
                    }
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={formData.openingHours[day]?.close || ''}
                    onChange={(e) =>
                      updateOpeningHours(day, 'close', e.target.value)
                    }
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Features (Press Enter to add)
            </label>
            <input
              type="text"
              onKeyDown={handleFeatureInput}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.features.map((feature) => (
                <span
                  key={feature}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        features: formData.features.filter((f) => f !== feature),
                      })
                    }
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Restaurant is active
              </span>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 