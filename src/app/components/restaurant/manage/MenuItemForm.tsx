'use client';

import { useState } from 'react';
import { 
  MenuItem, 
  MenuItemCategory,
  MenuItemTag,
  CuisineTag,
  DietaryInfo,
  Allergen,
  MENU_ITEM_CATEGORIES,
  MENU_ITEM_TAGS,
  CUISINE_TAGS,
  DIETARY_INFO,
  ALLERGENS
} from '@/lib/types/menu';
import { FaSave, FaTimes } from 'react-icons/fa';
import Select, { MultiValue, SingleValue } from 'react-select';

interface MenuItemFormProps {
  item?: MenuItem;
  categoryId: string;
  onSave: (item: MenuItem) => void;
  onCancel: () => void;
}

interface SelectOption<T> {
  value: T;
  label: string;
}

const selectStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: 'white',
    borderColor: '#D1D5DB',
  }),
  option: (base: any, state: { isSelected: boolean }) => ({
    ...base,
    backgroundColor: state.isSelected ? '#2563EB' : 'white',
    color: state.isSelected ? 'white' : '#111827',
    '&:hover': {
      backgroundColor: state.isSelected ? '#2563EB' : '#F3F4F6',
    },
  }),
  input: (base: any) => ({
    ...base,
    color: '#111827',
  }),
  singleValue: (base: any) => ({
    ...base,
    color: '#111827',
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: '#E5E7EB',
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: '#111827',
  }),
};

// Convertir los tipos a opciones para react-select
const categoryOptions: SelectOption<MenuItemCategory>[] = MENU_ITEM_CATEGORIES.map(cat => ({ value: cat, label: cat }));
const tagOptions: SelectOption<MenuItemTag>[] = MENU_ITEM_TAGS.map(tag => ({ value: tag, label: tag }));
const cuisineOptions: SelectOption<CuisineTag>[] = CUISINE_TAGS.map(cuisine => ({ value: cuisine, label: cuisine }));
const dietaryOptions: SelectOption<DietaryInfo>[] = DIETARY_INFO.map(info => ({ value: info, label: info }));
const allergenOptions: SelectOption<Allergen>[] = ALLERGENS.map(allergen => ({ value: allergen, label: allergen }));

export default function MenuItemForm({ item, categoryId, onSave, onCancel }: MenuItemFormProps) {
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || 0,
    categoryId: categoryId,
    category: item?.category || MENU_ITEM_CATEGORIES[0],
    available: item?.available ?? true,
    image: item?.image || '',
    tags: item?.tags || [],
    cuisineType: item?.cuisineType || [],
    dietaryInfo: item?.dietaryInfo || [],
    allergens: item?.allergens || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Asegurarse de que todos los campos requeridos estén presentes
    const itemToSave: MenuItem = {
      ...formData,
      id: item?.id || Date.now().toString(),
      categoryId: categoryId,
      available: formData.available ?? true,
      tags: formData.tags || [],
      cuisineType: formData.cuisineType || [],
      dietaryInfo: formData.dietaryInfo || [],
      allergens: formData.allergens || [],
      createdAt: item?.createdAt || new Date(),
      updatedAt: new Date()
    } as MenuItem;

    onSave(itemToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-900">
            Nombre del Plato *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-900">
            Descripción *
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
            required
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-900">
            Precio *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-900 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="price"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-900">
            Categoría *
          </label>
          <Select<SelectOption<MenuItemCategory>>
            id="category"
            value={categoryOptions.find(opt => opt.value === formData.category)}
            onChange={(selected: SingleValue<SelectOption<MenuItemCategory>>) => 
              setFormData(prev => ({ ...prev, category: selected?.value || MENU_ITEM_CATEGORIES[0] }))
            }
            options={categoryOptions}
            className="mt-1"
            styles={selectStyles}
            required
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-900">
            Etiquetas
          </label>
          <Select<SelectOption<MenuItemTag>, true>
            id="tags"
            isMulti
            value={tagOptions.filter(opt => formData.tags?.includes(opt.value))}
            onChange={(selected: MultiValue<SelectOption<MenuItemTag>>) => 
              setFormData(prev => ({ ...prev, tags: selected.map(opt => opt.value) }))
            }
            options={tagOptions}
            className="mt-1"
            styles={selectStyles}
          />
        </div>

        <div>
          <label htmlFor="cuisineType" className="block text-sm font-medium text-gray-900">
            Tipo de Cocina
          </label>
          <Select<SelectOption<CuisineTag>, true>
            id="cuisineType"
            isMulti
            value={cuisineOptions.filter(opt => formData.cuisineType?.includes(opt.value))}
            onChange={(selected: MultiValue<SelectOption<CuisineTag>>) => 
              setFormData(prev => ({ ...prev, cuisineType: selected.map(opt => opt.value) }))
            }
            options={cuisineOptions}
            className="mt-1"
            styles={selectStyles}
          />
        </div>

        <div>
          <label htmlFor="dietaryInfo" className="block text-sm font-medium text-gray-900">
            Información Dietética
          </label>
          <Select<SelectOption<DietaryInfo>, true>
            id="dietaryInfo"
            isMulti
            value={dietaryOptions.filter(opt => formData.dietaryInfo?.includes(opt.value))}
            onChange={(selected: MultiValue<SelectOption<DietaryInfo>>) => 
              setFormData(prev => ({ ...prev, dietaryInfo: selected.map(opt => opt.value) }))
            }
            options={dietaryOptions}
            className="mt-1"
            styles={selectStyles}
          />
        </div>

        <div>
          <label htmlFor="allergens" className="block text-sm font-medium text-gray-900">
            Alérgenos
          </label>
          <Select<SelectOption<Allergen>, true>
            id="allergens"
            isMulti
            value={allergenOptions.filter(opt => formData.allergens?.includes(opt.value))}
            onChange={(selected: MultiValue<SelectOption<Allergen>>) => 
              setFormData(prev => ({ ...prev, allergens: selected.map(opt => opt.value) }))
            }
            options={allergenOptions}
            className="mt-1"
            styles={selectStyles}
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-900">
            URL de la Imagen
          </label>
          <input
            type="url"
            id="image"
            value={formData.image}
            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="available"
            checked={formData.available}
            onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
            Disponible
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <FaTimes className="mr-2" />
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <FaSave className="mr-2" />
          {item ? 'Actualizar' : 'Crear'} Plato
        </button>
      </div>
    </form>
  );
} 