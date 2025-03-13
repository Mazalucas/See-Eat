'use client';

import { MenuCategory } from '@/lib/types/menu';
import { FiEdit2, FiTrash2, FiChevronUp, FiChevronDown, FiPlus } from 'react-icons/fi';
import MenuItemCard from './MenuItemCard';
import { useState } from 'react';

interface MenuCategoryCardProps {
  category: MenuCategory;
  onEdit?: () => void;
  onDelete?: () => void;
  onEditItem?: (itemId: string) => void;
  onDeleteItem?: (itemId: string) => void;
  onAddItem?: () => void;
  isEditable?: boolean;
}

export default function MenuCategoryCard({
  category,
  onEdit,
  onDelete,
  onEditItem,
  onDeleteItem,
  onAddItem,
  isEditable = false
}: MenuCategoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {isExpanded ? (
                  <FiChevronUp className="h-5 w-5" />
                ) : (
                  <FiChevronDown className="h-5 w-5" />
                )}
              </button>
            </div>
            {category.description && (
              <p className="mt-1 text-sm text-gray-600">{category.description}</p>
            )}
          </div>

          {isEditable && (
            <div className="flex gap-2 ml-4">
              <button
                onClick={onAddItem}
                className="p-2 text-green-600 hover:text-green-700 transition-colors"
                title="Agregar plato"
              >
                <FiPlus className="h-5 w-5" />
              </button>
              <button
                onClick={onEdit}
                className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                title="Editar categoría"
              >
                <FiEdit2 className="h-5 w-5" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-red-600 hover:text-red-700 transition-colors"
                title="Eliminar categoría"
              >
                <FiTrash2 className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          {category.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  isEditable={isEditable}
                  onEdit={() => onEditItem?.(item.id)}
                  onDelete={() => onDeleteItem?.(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay platos en esta categoría
              {isEditable && (
                <button
                  onClick={onAddItem}
                  className="mt-2 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 w-full"
                >
                  <FiPlus className="h-5 w-5" />
                  Agregar el primer plato
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 