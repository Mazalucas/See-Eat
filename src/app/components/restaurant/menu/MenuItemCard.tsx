'use client';

import { MenuItem } from '@/lib/types/menu';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import Image from 'next/image';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
}

const SPICY_LEVELS = ['No Picante', 'Suave', 'Medio', 'Picante'];

export default function MenuItemCard({ item, onEdit, onDelete, isEditable = false }: MenuItemCardProps) {
  const renderSpicyLevel = () => {
    if (item.spicyLevel === 0) return null;
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: item.spicyLevel }).map((_, i) => (
          <span key={i} className="text-red-500">🌶️</span>
        ))}
        <span className="text-sm text-gray-600 ml-1">
          ({SPICY_LEVELS[item.spicyLevel]})
        </span>
      </div>
    );
  };

  const renderTags = () => {
    const allTags = [
      ...item.dietaryTags.map(tag => ({
        label: tag.charAt(0).toUpperCase() + tag.slice(1).replace(/_/g, ' '),
        color: 'bg-green-100 text-green-800'
      })),
      ...item.allergens.map(allergen => ({
        label: allergen.charAt(0).toUpperCase() + allergen.slice(1).replace(/_/g, ' '),
        color: 'bg-red-100 text-red-800'
      }))
    ];

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {allTags.map((tag, index) => (
          <span
            key={index}
            className={`px-2 py-1 rounded-full text-xs font-medium ${tag.color}`}
          >
            {tag.label}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${!item.available ? 'opacity-60' : ''}`}>
      <div className="relative h-48">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Sin imagen</span>
          </div>
        )}
        {!item.available && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-medium">No Disponible</span>
          </div>
        )}
        {item.popular && (
          <div className="absolute top-2 right-2">
            <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
              Popular
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
            {renderSpicyLevel()}
          </div>
          <div className="text-lg font-bold text-gray-900">
            {item.price.toFixed(2)}€
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-600">{item.description}</p>

        {renderTags()}

        {isEditable && (
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
              title="Editar"
            >
              <FiEdit2 className="h-5 w-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:text-red-700 transition-colors"
              title="Eliminar"
            >
              <FiTrash2 className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 