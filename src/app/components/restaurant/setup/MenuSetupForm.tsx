'use client';

import { useState } from 'react';
import { FaPlus, FaTrash, FaImage } from 'react-icons/fa';
import Image from 'next/image';
import { RestaurantProfile } from '@/lib/types/auth';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
}

interface MenuSetupFormProps {
  initialData: Partial<RestaurantProfile>;
  onComplete: (data: Partial<RestaurantProfile>) => void;
  onBack: () => void;
  loading: boolean;
}

const CATEGORIES = [
  'Entradas',
  'Platos Principales',
  'Postres',
  'Bebidas',
  'Especiales',
  'Guarniciones',
];

export default function MenuSetupForm({ initialData, onComplete, onBack, loading }: MenuSetupFormProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialData.menuItems as MenuItem[] || []);
  const [currentItem, setCurrentItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    isAvailable: true,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleAddItem = () => {
    if (!currentItem.name || !currentItem.price || !currentItem.category) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setMenuItems([...menuItems, { ...currentItem, id: generateId() } as MenuItem]);
    setCurrentItem({
      name: '',
      description: '',
      price: 0,
      category: '',
      isAvailable: true,
    });
    setError('');
  };

  const handleRemoveItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (menuItems.length === 0) {
      setError('Agrega al menos un ítem al menú');
      return;
    }

    setSaving(true);
    try {
      await onComplete({ menuItems });
    } catch (err) {
      setError('Error al guardar el menú');
      console.error('Error:', err);
    } finally {
      setSaving(false);
    }
  };

  const isLoading = loading || saving;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Agregar Ítems al Menú
          </h3>
          
          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre del Plato *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={currentItem.name}
                  onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white text-gray-900"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Precio *
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="price"
                  id="price"
                  min="0"
                  step="0.01"
                  value={currentItem.price}
                  onChange={(e) => setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) })}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white text-gray-900"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white text-gray-900"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Categoría *
              </label>
              <div className="mt-1">
                <select
                  id="category"
                  name="category"
                  value={currentItem.category}
                  onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white text-gray-900"
                >
                  <option value="">Selecciona una categoría</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="isAvailable" className="block text-sm font-medium text-gray-700">
                Disponibilidad
              </label>
              <div className="mt-1">
                <select
                  id="isAvailable"
                  name="isAvailable"
                  value={currentItem.isAvailable ? 'true' : 'false'}
                  onChange={(e) => setCurrentItem({ ...currentItem, isAvailable: e.target.value === 'true' })}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white text-gray-900"
                >
                  <option value="true">Disponible</option>
                  <option value="false">No Disponible</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-6">
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <FaPlus className="mr-2 h-4 w-4" />
                Agregar Ítem
              </button>
            </div>
          </div>

          {/* Lista de ítems */}
          {menuItems.length > 0 && (
            <div className="mt-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Ítems del Menú ({menuItems.length})
              </h4>
              <div className="space-y-4">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-gray-900">{item.name}</h5>
                      <p className="text-sm text-gray-500">{item.description}</p>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>${item.price.toFixed(2)}</span>
                        <span>•</span>
                        <span>{item.category}</span>
                        <span>•</span>
                        <span>{item.isAvailable ? 'Disponible' : 'No disponible'}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="ml-4 text-red-600 hover:text-red-800"
                      disabled={isLoading}
                    >
                      <FaTrash className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          Anterior
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : 'Finalizar'}
        </button>
      </div>
    </form>
  );
} 