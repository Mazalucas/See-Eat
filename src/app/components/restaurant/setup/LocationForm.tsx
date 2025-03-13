'use client';

import { useState } from 'react';
import { RestaurantProfile } from '@/lib/types/auth';
import { saveRestaurantDraft } from '@/lib/firebase/restaurantUtils';
import { useAuth } from '@/lib/hooks/useAuth';
import { geocodeAddress } from '@/lib/utils/geocoding';

interface LocationFormProps {
  initialData: Partial<RestaurantProfile>;
  onComplete: (data: Partial<RestaurantProfile>) => void;
  onBack: () => void;
  loading: boolean;
}

export default function LocationForm({ initialData, onComplete, onBack, loading }: LocationFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    address: {
      street: initialData.address?.street || '',
      city: initialData.address?.city || '',
      state: initialData.address?.state || '',
      postalCode: initialData.address?.postalCode || '',
      country: initialData.address?.country || '',
      coordinates: initialData.address?.coordinates || undefined,
    },
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError('');

    try {
      // Validar campos requeridos
      if (!formData.address.street || !formData.address.city || !formData.address.state || !formData.address.postalCode || !formData.address.country) {
        setError('Por favor complete todos los campos requeridos');
        return;
      }

      // Obtener coordenadas
      const coordinates = await geocodeAddress(formData.address);
      if (!coordinates) {
        setError('No se pudieron obtener las coordenadas de la dirección. Por favor, verifique que la dirección sea correcta.');
        return;
      }

      // Actualizar la dirección con las coordenadas
      const addressWithCoordinates = {
        ...formData.address,
        coordinates
      };

      // Guardar borrador
      await saveRestaurantDraft(user.uid, { address: addressWithCoordinates });

      // Continuar al siguiente paso
      onComplete({ address: addressWithCoordinates });
    } catch (err) {
      setError('Error al guardar la información');
      console.error('Error saving location info:', err);
    } finally {
      setSaving(false);
    }
  };

  const isLoading = loading || saving;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="street" className="block text-sm font-medium text-gray-700">
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
            required
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
            required
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            País *
          </label>
          <select
            id="country"
            value={formData.address.country}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              address: { ...prev.address, country: e.target.value }
            }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
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

      <div className="flex justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          Atrás
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Guardando...' : 'Continuar'}
        </button>
      </div>
    </form>
  );
} 