'use client';

import { useState } from 'react';
import { Menu, MenuCategory, MenuItem } from '@/lib/types/menu';
import { FiPlus } from 'react-icons/fi';
import CategoryForm from '../menu/CategoryForm';
import ItemForm from '../menu/ItemForm';
import MenuCategoryCard from '../menu/MenuCategoryCard';

interface MenuBuilderProps {
  initialMenu?: Menu;
  onSave: (menu: Menu) => void;
  loading?: boolean;
}

const DEFAULT_MENU: Menu = {
  id: '',
  restaurantId: '',
  categories: [],
  lastUpdated: new Date().toISOString(),
  version: 1,
  status: 'draft',
  currency: 'EUR',
  languageCode: 'es',
};

export default function MenuBuilder({ initialMenu, onSave, loading = false }: MenuBuilderProps) {
  const [menu, setMenu] = useState<Menu>(initialMenu || DEFAULT_MENU);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<{ item: MenuItem | null; categoryId: string | null }>({
    item: null,
    categoryId: null,
  });

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setMenu((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== categoryId),
    }));
  };

  const handleSaveCategory = (categoryData: Omit<MenuCategory, 'id' | 'items'>) => {
    setMenu((prev) => {
      if (editingCategory) {
        return {
          ...prev,
          categories: prev.categories.map((c) =>
            c.id === editingCategory.id
              ? { ...editingCategory, ...categoryData }
              : c
          ),
        };
      }
      return {
        ...prev,
        categories: [
          ...prev.categories,
          {
            ...categoryData,
            id: crypto.randomUUID(),
            items: [],
          },
        ],
      };
    });
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const handleAddItem = (categoryId: string) => {
    setEditingItem({ item: null, categoryId });
    setShowItemForm(true);
  };

  const handleEditItem = (item: MenuItem, categoryId: string) => {
    setEditingItem({ item, categoryId });
    setShowItemForm(true);
  };

  const handleDeleteItem = (itemId: string, categoryId: string) => {
    setMenu((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === categoryId
          ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
          : c
      ),
    }));
  };

  const handleSaveItem = (itemData: Omit<MenuItem, 'id'>) => {
    if (!editingItem.categoryId) return;

    setMenu((prev) => {
      const updatedCategories = prev.categories.map((category) => {
        if (category.id !== editingItem.categoryId) return category;

        const updatedItems = editingItem.item
          ? category.items.map((item) =>
              item.id === editingItem.item?.id
                ? { ...itemData, id: item.id }
                : item
            )
          : [
              ...category.items,
              {
                ...itemData,
                id: crypto.randomUUID(),
              },
            ];

        return {
          ...category,
          items: updatedItems,
        };
      });

      return {
        ...prev,
        categories: updatedCategories,
      };
    });

    setShowItemForm(false);
    setEditingItem({ item: null, categoryId: null });
  };

  const handleSave = () => {
    onSave({
      ...menu,
      lastUpdated: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Menú</h2>
        <div className="flex gap-3">
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Añadir Categoría
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Guardando...' : 'Guardar Menú'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {menu.categories.map((category) => (
          <MenuCategoryCard
            key={category.id}
            category={category}
            isEditable
            onEdit={() => handleEditCategory(category)}
            onDelete={() => handleDeleteCategory(category.id)}
            onAddItem={() => handleAddItem(category.id)}
            onEditItem={(itemId) => {
              const item = category.items.find(i => i.id === itemId);
              if (item) {
                handleEditItem(item, category.id);
              }
            }}
            onDeleteItem={(itemId) => handleDeleteItem(itemId, category.id)}
          />
        ))}
      </div>

      {showCategoryForm && (
        <CategoryForm
          initialData={editingCategory || undefined}
          onSubmit={handleSaveCategory}
          onCancel={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
          loading={loading}
        />
      )}

      {showItemForm && (
        <ItemForm
          initialData={editingItem.item || undefined}
          onSubmit={handleSaveItem}
          onCancel={() => {
            setShowItemForm(false);
            setEditingItem({ item: null, categoryId: null });
          }}
          loading={loading}
        />
      )}
    </div>
  );
} 