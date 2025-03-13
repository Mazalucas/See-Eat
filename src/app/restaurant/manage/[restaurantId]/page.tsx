'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getRestaurantProfile, deleteRestaurantProfile } from '@/lib/firebase/restaurantUtils';
import { RestaurantProfile } from '@/lib/types/auth';
import { FaStore, FaUtensils, FaClock, FaImage, FaStar } from 'react-icons/fa';
import BasicInfoForm from '@/app/components/restaurant/manage/BasicInfoForm';
import ScheduleForm from '@/app/components/restaurant/manage/ScheduleForm';
import MenuForm from '@/app/components/restaurant/manage/MenuForm';

interface TabProps {
  id: string;
  label: string;
  icon: React.ElementType;
}

const tabs: TabProps[] = [
  { id: 'info', label: 'Información', icon: FaStore },
  { id: 'menu', label: 'Menú', icon: FaUtensils },
  { id: 'horario', label: 'Horario', icon: FaClock },
  { id: 'galeria', label: 'Galería', icon: FaImage },
  { id: 'resenas', label: 'Reseñas', icon: FaStar },
];

export default function RestaurantManage({ params }: { params: { restaurantId: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const loadRestaurant = async () => {
      if (!user) return;

      try {
        const restaurantData = await getRestaurantProfile(params.restaurantId);
        if (!restaurantData) {
          setError('Restaurante no encontrado');
          return;
        }

        // Verificar que el restaurante pertenece al usuario actual
        if (restaurantData.uid !== user.uid) {
          router.push('/restaurant/dashboard');
          return;
        }

        setRestaurant(restaurantData);
      } catch (err) {
        console.error('Error loading restaurant:', err);
        setError('Error al cargar la información del restaurante');
      } finally {
        setLoading(false);
      }
    };

    loadRestaurant();
  }, [user, params.restaurantId, router]);

  const handleRestaurantUpdate = (updatedData: Partial<RestaurantProfile>) => {
    if (restaurant) {
      setRestaurant({ ...restaurant, ...updatedData });
    }
  };

  const handleDeleteRestaurant = async () => {
    if (!restaurant || !confirm('¿Estás seguro de que deseas eliminar este restaurante? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteRestaurantProfile(params.restaurantId);
      router.push('/restaurant/dashboard');
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      alert('Error al eliminar el restaurante. Por favor, intenta de nuevo.');
    }
  };

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error || 'No se pudo cargar el restaurante'}
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    if (!restaurant) return null;

    switch (activeTab) {
      case 'info':
        return (
          <div className="space-y-6">
            <BasicInfoForm
              restaurant={restaurant}
              onUpdate={handleRestaurantUpdate}
            />
            <div className="border-t pt-6">
              <button
                onClick={handleDeleteRestaurant}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Eliminar Restaurante
              </button>
            </div>
          </div>
        );
      case 'menu':
        return (
          <MenuForm
            restaurant={restaurant}
            restaurantId={params.restaurantId}
            onUpdate={handleRestaurantUpdate}
          />
        );
      case 'horario':
        return (
          <ScheduleForm
            restaurant={restaurant}
            onUpdate={handleRestaurantUpdate}
          />
        );
      case 'galeria':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Galería de Imágenes</h3>
            <p className="text-gray-900">Sube y gestiona las fotos de tu restaurante y platos.</p>
            <div className="bg-gray-50 p-4 rounded-md text-gray-900">
              Próximamente: Subida y gestión de imágenes.
            </div>
          </div>
        );
      case 'resenas':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Reseñas y Calificaciones</h3>
            <p className="text-gray-900">Visualiza y responde a las reseñas de tus clientes.</p>
            <div className="bg-gray-50 p-4 rounded-md text-gray-900">
              Próximamente: Sistema de reseñas y calificaciones.
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{restaurant.restaurantName}</h1>
          <p className="mt-2 text-sm text-gray-900">
            {restaurant.address?.street}, {restaurant.address?.city}
          </p>
          <div className="mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              restaurant.status === 'active' 
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {restaurant.status === 'active' ? 'Activo' : 'Pendiente'}
            </span>
          </div>
        </div>

        {/* Pestañas */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center py-4 px-1 border-b-2 font-medium text-sm
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'}
                    `}
                  >
                    <Icon className="mr-2 h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Contenido de la pestaña activa */}
        <div className="bg-white shadow rounded-lg p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
} 