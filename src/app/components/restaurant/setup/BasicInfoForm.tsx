'use client';

import { useState } from 'react';
import { RestaurantProfile } from '@/lib/types/auth';
import { saveRestaurantDraft } from '@/lib/firebase/restaurantUtils';
import { useAuth } from '@/lib/hooks/useAuth';
import Image from 'next/image';
import { FaTimes } from 'react-icons/fa';

const CUISINE_TYPES = [
  'Italiana',
  'Mexicana',
  'China',
  'Japonesa',
  'Tailandesa',
  'India',
  'Mediterránea',
  'Americana',
  'Francesa',
  'Española',
  'Peruana',
  'Argentina',
  'Vegana',
  'Saludable',
  'Fusión',
  'Mariscos',
  'Pizzería',
  'Hamburguesas',
  'Sushi',
  'Café',
  'Postres',
  'Bar',
];

interface BasicInfoFormProps {
  initialData: Partial<RestaurantProfile>;
  onComplete: (data: Partial<RestaurantProfile>) => void;
  loading: boolean;
}

export default function BasicInfoForm({ initialData, onComplete, loading }: BasicInfoFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    restaurantName: initialData.restaurantName || '',
    description: initialData.description || '',
    phone: initialData.phone || '',
    website: initialData.website || '',
    cuisine: initialData.cuisine || [],
    status: initialData.status || 'pending' as const,
    address: initialData.address || {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    schedule: initialData.schedule || {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: false },
    },
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCuisineDropdown, setShowCuisineDropdown] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Current user:', user);
    
    if (!user?.uid) {
      console.error('No user UID found');
      setError('Usuario no autenticado. Por favor, inicie sesión nuevamente.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Validar campos requeridos
      if (!formData.restaurantName || !formData.description || !formData.phone || formData.cuisine.length === 0) {
        setError('Por favor complete todos los campos requeridos');
        setSaving(false);
        return;
      }

      console.log('Preparando datos para guardar...');
      console.log('User UID:', user.uid);

      // Preparar los datos del restaurante
      const restaurantData: Partial<RestaurantProfile> = {
        role: 'restaurant' as const,
        displayName: formData.restaurantName,
        email: user.email || '',
        uid: user.uid,
        restaurantName: formData.restaurantName,
        description: formData.description,
        phone: formData.phone,
        website: formData.website || '',
        cuisine: formData.cuisine,
        status: 'pending' as const,
        address: {
          street: formData.address.street || '',
          city: formData.address.city || '',
          state: formData.address.state || '',
          postalCode: formData.address.postalCode || '',
          country: formData.address.country || '',
        },
        schedule: formData.schedule,
      };

      console.log('Datos a guardar:', JSON.stringify(restaurantData, null, 2));

      // Guardar borrador
      await saveRestaurantDraft(user.uid, restaurantData);
      console.log('Borrador guardado exitosamente');

      // Continuar al siguiente paso
      onComplete(restaurantData);
    } catch (err) {
      console.error('Error completo al guardar:', err);
      if (err instanceof Error) {
        setError(`Error al guardar la información: ${err.message}`);
      } else {
        setError('Error al guardar la información. Por favor, intente nuevamente.');
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleCuisineType = (cuisine: string) => {
    setFormData(prev => ({
      ...prev,
      cuisine: prev.cuisine.includes(cuisine)
        ? prev.cuisine.filter(type => type !== cuisine)
        : [...prev.cuisine, cuisine],
    }));
  };

  const removeCuisineType = (cuisine: string) => {
    setFormData(prev => ({
      ...prev,
      cuisine: prev.cuisine.filter(type => type !== cuisine),
    }));
  };

  const isLoading = loading || saving;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div>
        <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700">
          Nombre del Restaurante *
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="restaurantName"
            required
            value={formData.restaurantName}
            onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descripción *
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
          <p className="mt-2 text-sm text-gray-500">
            Describe tu restaurante, especialidades y ambiente
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Teléfono *
        </label>
        <div className="mt-1">
          <input
            type="tel"
            id="phone"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700">
          Sitio Web
        </label>
        <div className="mt-1">
          <input
            type="url"
            id="website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="https://"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tipos de Cocina *
        </label>
        <div className="mt-1 relative">
          <button
            type="button"
            onClick={() => setShowCuisineDropdown(!showCuisineDropdown)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            {formData.cuisine.length > 0 
              ? 'Tipos seleccionados'
              : 'Selecciona los tipos de cocina'}
          </button>

          {/* Selected cuisines tags */}
          {formData.cuisine.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.cuisine.map((cuisine) => (
                <span
                  key={cuisine}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {cuisine}
                  <button
                    type="button"
                    onClick={() => removeCuisineType(cuisine)}
                    className="ml-1 inline-flex items-center p-0.5 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                  >
                    <FaTimes className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Dropdown menu */}
          {showCuisineDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              <div className="grid grid-cols-2 gap-2 p-2">
                {CUISINE_TYPES.map((cuisine) => (
                  <button
                    key={cuisine}
                    type="button"
                    onClick={() => toggleCuisineType(cuisine)}
                    className={`px-4 py-2 text-sm rounded-md text-left ${
                      formData.cuisine.includes(cuisine)
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Selecciona todos los tipos de cocina que ofreces
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Guardando...' : 'Siguiente'}
        </button>
      </div>
    </form>
  );
} 