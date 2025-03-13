'use client';

import { useState } from 'react';
import { RestaurantProfile } from '@/lib/types/auth';
import { updateRestaurantProfile } from '@/lib/firebase/restaurantUtils';
import { FaSave } from 'react-icons/fa';

interface BasicInfoFormProps {
  restaurant: RestaurantProfile;
  onUpdate: (updatedData: Partial<RestaurantProfile>) => void;
}

export default function BasicInfoForm({ restaurant, onUpdate }: BasicInfoFormProps) {
  const [formData, setFormData] = useState({
    restaurantName: restaurant.restaurantName || '',
    description: restaurant.description || '',
    cuisine: restaurant.cuisine || [],
    phone: restaurant.phone || '',
    email: restaurant.email || '',
    website: restaurant.website || '',
    address: {
      street: restaurant.address?.street || '',
      city: restaurant.address?.city || '',
      state: restaurant.address?.state || '',
      postalCode: restaurant.address?.postalCode || '',
      country: restaurant.address?.country || '',
      coordinates: restaurant.address?.coordinates,
    },
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await updateRestaurantProfile(restaurant.uid, formData);
      onUpdate(formData);
      setSuccess(true);
    } catch (err) {
      console.error('Error updating restaurant:', err);
      setError('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleCuisineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cuisineArray = e.target.value.split(',').map(item => item.trim());
    setFormData(prev => ({ ...prev, cuisine: cuisineArray }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-md">
          Cambios guardados correctamente
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-900">
            Nombre del Restaurante *
          </label>
          <input
            type="text"
            id="restaurantName"
            value={formData.restaurantName}
            onChange={(e) => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>

        <div>
          <label htmlFor="cuisine" className="block text-sm font-medium text-gray-900">
            Tipo de Cocina (separar por comas) *
          </label>
          <input
            type="text"
            id="cuisine"
            value={formData.cuisine.join(', ')}
            onChange={handleCuisineChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-900">
            Descripción *
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
            Teléfono *
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-900">
            Correo Electrónico *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="website" className="block text-sm font-medium text-gray-900">
            Sitio Web
          </label>
          <input
            type="url"
            id="website"
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <div className="sm:col-span-2">
          <h4 className="text-base font-medium text-gray-900 mb-4">Dirección</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="street" className="block text-sm font-medium text-gray-900">
                Calle y Número *
              </label>
              <input
                type="text"
                id="street"
                value={formData.address.street}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, street: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-900">
                Ciudad *
              </label>
              <input
                type="text"
                id="city"
                value={formData.address.city}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, city: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-900">
                Estado/Provincia *
              </label>
              <input
                type="text"
                id="state"
                value={formData.address.state}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, state: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-900">
                Código Postal *
              </label>
              <input
                type="text"
                id="postalCode"
                value={formData.address.postalCode}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, postalCode: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-900">
                País *
              </label>
              <select
                id="country"
                value={formData.address.country}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, country: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                required
              >
                <option value="">Seleccionar país</option>
                <option value="ES">España</option>
                <option value="MX">México</option>
                <option value="AR">Argentina</option>
                <option value="CO">Colombia</option>
                <option value="CL">Chile</option>
                <option value="PE">Perú</option>
                <option value="US">Estados Unidos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            saving ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <FaSave className="mr-2" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
} 