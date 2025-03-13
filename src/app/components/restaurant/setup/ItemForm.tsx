'use client';

import { useState } from 'react';
import { MenuItem, Allergen, DietaryTag, SpicyLevel } from '@/lib/types/menu';
import { FiX } from 'react-icons/fi';

interface ItemFormProps {
  initialData?: Partial<MenuItem>;
  onSubmit: (data: Omit<MenuItem, 'id'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ALLERGENS: { value: Allergen; label: string }[] = [
  { value: 'gluten', label: 'Gluten' },
  { value: 'crustaceos', label: 'Crustáceos' },
  { value: 'huevos', label: 'Huevos' },
  { value: 'pescado', label: 'Pescado' },
  { value: 'cacahuetes', label: 'Cacahuetes' },
  { value: 'soja', label: 'Soja' },
  { value: 'lacteos', label: 'Lácteos' },
  { value: 'frutos_secos', label: 'Frutos Secos' },
  { value: 'apio', label: 'Apio' },
  { value: 'mostaza', label: 'Mostaza' },
  { value: 'sesamo', label: 'Sésamo' },
  { value: 'sulfitos', label: 'Sulfitos' },
  { value: 'moluscos', label: 'Moluscos' },
  { value: 'altramuces', label: 'Altramuces' },
];

const DIETARY_TAGS: { value: DietaryTag; label: string }[] = [
  { value: 'vegetariano', label: 'Vegetariano' },
  { value: 'vegano', label: 'Vegano' },
  { value: 'sin_gluten', label: 'Sin Gluten' },
  { value: 'sin_lactosa', label: 'Sin Lactosa' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'bajo_en_calorias', label: 'Bajo en Calorías' },
  { value: 'bajo_en_carbohidratos', label: 'Bajo en Carbohidratos' },
  { value: 'bajo_en_sodio', label: 'Bajo en Sodio' },
  { value: 'alto_en_proteinas', label: 'Alto en Proteínas' },
];

const SPICY_LEVELS: { value: SpicyLevel; label: string }[] = [
  { value: 0, label: 'No Picante' },
  { value: 1, label: 'Suave' },
  { value: 2, label: 'Medio' },
  { value: 3, label: 'Picante' },
];

export default function ItemForm({ initialData, onSubmit, onCancel, loading }: ItemFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    image: initialData?.image || '',
    allergens: initialData?.allergens || [],
    dietaryTags: initialData?.dietaryTags || [],
    available: initialData?.available ?? true,
    popular: initialData?.popular || false,
    spicyLevel: initialData?.spicyLevel || (0 as SpicyLevel),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAllergenChange = (allergen: Allergen) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen],
    }));
  };

  const handleDietaryTagChange = (tag: DietaryTag) => {
    setFormData(prev => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter(t => t !== tag)
        : [...prev.dietaryTags, tag],
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-lg font-medium text-gray-900">
            {initialData ? 'Editar Plato' : 'Nuevo Plato'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Precio *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">€</span>
                </div>
                <input
                  type="number"
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descripción *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              URL de la Imagen
            </label>
            <input
              type="url"
              id="image"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="https://"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivel de Picante
            </label>
            <div className="flex gap-4">
              {SPICY_LEVELS.map((level) => (
                <label key={level.value} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={level.value}
                    checked={formData.spicyLevel === level.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, spicyLevel: parseInt(e.target.value) as SpicyLevel }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{level.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alérgenos
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {ALLERGENS.map((allergen) => (
                  <label key={allergen.value} className="inline-flex items-center w-full">
                    <input
                      type="checkbox"
                      checked={formData.allergens.includes(allergen.value)}
                      onChange={() => handleAllergenChange(allergen.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{allergen.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiquetas Dietéticas
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {DIETARY_TAGS.map((tag) => (
                  <label key={tag.value} className="inline-flex items-center w-full">
                    <input
                      type="checkbox"
                      checked={formData.dietaryTags.includes(tag.value)}
                      onChange={() => handleDietaryTagChange(tag.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{tag.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Disponible</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.popular}
                onChange={(e) => setFormData(prev => ({ ...prev, popular: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Popular</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 