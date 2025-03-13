'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { FaMapMarkerAlt, FaUtensils, FaStar, FaMedal, FaStore, FaExclamationCircle } from 'react-icons/fa';
import type { UserProfile, Review, CustomerProfile, DietaryTag } from '@/lib/types/auth';
import { isCustomerProfile } from '@/lib/types/auth';
import { getUserProfile, createUserProfile, getUserReviews } from '../../lib/firebase/userUtils';
import EditProfileForm from '@/app/components/EditProfileForm';

const defaultImage = '/assets/images/defaults/default-review-image.jpg';

export default function ProfilePage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState('timeline');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        let userProfile = await getUserProfile(currentUser.uid);
        
        if (!userProfile) {
          // Create a default customer profile if none exists
          const newProfile: Omit<CustomerProfile, 'createdAt' | 'updatedAt'> = {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Usuario',
            role: 'customer',
            photoURL: currentUser.photoURL || '',
            dietaryPreferences: [],
            favoriteRestaurants: [],
            favoriteItems: [],
            reviews: []
          };
          
          userProfile = await createUserProfile(currentUser.uid, newProfile);
        }

        setProfile(userProfile);
        const userReviews = await getUserReviews(currentUser.uid);
        setReviews(userReviews);
      } catch (err) {
        console.error('Error:', err);
        setError('Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [currentUser]);

  const handleProfileUpdate = async () => {
    if (!currentUser?.uid) return;
    
    try {
      setLoading(true);
      const { getUserProfile, getUserReviews } = await import('@/lib/firebase/userUtils');
      
      const [profileData, reviewsData] = await Promise.all([
        getUserProfile(currentUser.uid),
        getUserReviews(currentUser.uid)
      ]);
      
      setProfile(profileData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error updating profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRestaurant = () => {
    router.push('/restaurant/create');
  };

  const getFavoriteRestaurantsCount = (profile: UserProfile): number => {
    if (!isCustomerProfile(profile)) return 0;
    return profile.favoriteRestaurants?.length || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <FaExclamationCircle className="w-12 h-12 text-red-500" />
        <p className="text-xl text-gray-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-gray-700">No se encontró el perfil</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const achievements = [
    { id: 1, name: 'Foodie Explorer', description: '¡Has visitado 5 restaurantes!', icon: FaUtensils },
    { id: 2, name: 'Review Master', description: '¡Has escrito 10 reseñas!', icon: FaStar },
    { id: 3, name: 'Local Guide', description: '¡Has explorado 3 barrios diferentes!', icon: FaMapMarkerAlt },
  ];

  const stats = [
    {
      icon: <FaUtensils className="w-5 h-5" />,
      label: 'Restaurantes Favoritos',
      value: getFavoriteRestaurantsCount(profile),
    },
    {
      icon: <FaStar className="w-5 h-5" />,
      label: 'Reseñas',
      value: reviews.length,
    },
    {
      icon: <FaMedal className="w-5 h-5" />,
      label: 'Nivel',
      value: 'Foodie',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-32 h-32 bg-gray-200 rounded-full">
              {profile.photoURL ? (
                <Image
                  src={profile.photoURL}
                  alt={profile.displayName || 'User'}
                  fill
                  sizes="(max-width: 128px) 100vw, 128px"
                  className="rounded-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400 uppercase">
                  {profile.displayName?.[0] || 'U'}
                </div>
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900">{profile.displayName}</h1>
              <p className="text-gray-600">{'No bio yet'}</p>
              {isCustomerProfile(profile) && profile.dietaryPreferences && profile.dietaryPreferences.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                  {profile.dietaryPreferences.map((pref: DietaryTag) => (
                    <span key={pref} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {pref}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="ml-auto flex gap-2">
              {isCustomerProfile(profile) && (
                <button
                  onClick={handleCreateRestaurant}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <FaStore className="w-4 h-4" />
                  Crear Restaurante
                </button>
              )}
              <button
                onClick={() => setShowEditForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Editar Perfil
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4"
              >
                <div className="p-3 bg-blue-100 rounded-full text-blue-600">{stat.icon}</div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`${
                activeTab === 'timeline'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`${
                activeTab === 'achievements'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Logros
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`${
                activeTab === 'favorites'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Favoritos
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {activeTab === 'timeline' && (
            <div className="space-y-8">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="relative w-16 h-16">
                        <Image
                          src={review.restaurantImage || defaultImage}
                          alt={review.restaurantName}
                          fill
                          sizes="(max-width: 64px) 100vw, 64px"
                          className="rounded-md object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = defaultImage;
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{review.restaurantName}</h3>
                        <div className="flex items-center gap-2 text-yellow-400">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <FaStar key={i} />
                          ))}
                        </div>
                        <p className="mt-2 text-gray-600">{review.comment}</p>
                        {review.images && review.images.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            {review.images.map((image, index) => (
                              <div key={index} className="relative aspect-square">
                                <Image
                                  src={image || defaultImage}
                                  alt={`Review image ${index + 1}`}
                                  fill
                                  sizes="(max-width: 300px) 100vw, 300px"
                                  className="rounded-md object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = defaultImage;
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="mt-2 text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No has escrito reseñas aún.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <achievement.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isCustomerProfile(profile) && profile.favoriteRestaurants && profile.favoriteRestaurants.length > 0 ? (
                <div>
                  {/* Add favorite restaurants list here */}
                </div>
              ) : (
                <div className="text-center py-12 col-span-full">
                  <p className="text-gray-600">No has marcado restaurantes como favoritos aún.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditForm && (
        <EditProfileForm
          profile={profile}
          onClose={() => setShowEditForm(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
} 