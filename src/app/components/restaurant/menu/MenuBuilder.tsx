'use client';

import { useState } from 'react';
import { Menu, MenuCategory, MenuItem } from '@/lib/types/menu';
import { FiPlus } from 'react-icons/fi';
import MenuCategoryCard from './MenuCategoryCard';
import CategoryForm from './CategoryForm';
import ItemForm from './ItemForm';

interface MenuBuilderProps {
  initialMenu: Menu;
  onSave: (menu: Menu) => void;
  loading?: boolean;
}

export default function MenuBuilder({ initialMenu, onSave, loading = false }: MenuBuilderProps) {
  const [menu, setMenu] = useState<Menu>(initialMenu);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<{ categoryId: string; item: MenuItem } | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const handleAddCategory = (categoryData: Omit<MenuCategory, 'id' | 'items'>) => {
    const newCategory: MenuCategory = {
      ...categoryData,
      id: `category-${Date.now()}`,
      items: [],
    };

    setMenu(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));
    setShowCategoryForm(false);
  };

  const handleUpdateCategory = (categoryId: string, categoryData: Partial<MenuCategory>) => {
    setMenu(prev => ({
      ...prev,
      categories: prev.categories.map(category =>
        category.id === categoryId
          ? { ...category, ...categoryData }
          : category
      ),
    }));
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría? Se eliminarán todos los platos que contiene.')) {
      return;
    }

    setMenu(prev => ({
      ...prev,
      categories: prev.categories.filter(category => category.id !== categoryId),
    }));
  };

  const handleAddItem = (categoryId: string, itemData: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...itemData,
      id: `item-${Date.now()}`,
    };

    setMenu(prev => ({
      ...prev,
      categories: prev.categories.map(category =>
        category.id === categoryId
          ? { ...category, items: [...category.items, newItem] }
          : category
      ),
    }));
    setShowItemForm(false);
    setSelectedCategoryId(null);
  };

  const handleUpdateItem = (categoryId: string, itemId: string, itemData: Partial<MenuItem>) => {
    setMenu(prev => ({
      ...prev,
      categories: prev.categories.map(category =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map(item =>
                item.id === itemId
                  ? { ...item, ...itemData }
                  : item
              ),
            }
          : category
      ),
    }));
    setEditingItem(null);
    setShowItemForm(false);
  };

  const handleDeleteItem = (categoryId: string, itemId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este plato?')) {
      return;
    }

    setMenu(prev => ({
      ...prev,
      categories: prev.categories.map(category =>
        category.id === categoryId
          ? { ...category, items: category.items.filter(item => item.id !== itemId) }
          : category
      ),
    }));
  };

  const handleSave = () => {
    onSave({
      ...menu,
      lastUpdated: new Date().toISOString(),
      version: menu.version + 1,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Menú</h1>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowCategoryForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiPlus className="h-5 w-5" />
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

      <div className="space-y-4">
        {menu.categories.map((category) => (
          <MenuCategoryCard
            key={category.id}
            category={category}
            isEditable
            onEdit={() => {
              setEditingCategory(category);
              setShowCategoryForm(true);
            }}
            onDelete={() => handleDeleteCategory(category.id)}
            onEditItem={(itemId) => {
              const item = category.items.find(i => i.id === itemId);
              if (item) {
                setEditingItem({ categoryId: category.id, item });
                setShowItemForm(true);
              }
            }}
            onDeleteItem={(itemId) => handleDeleteItem(category.id, itemId)}
            onAddItem={() => {
              setEditingItem(null);
              setSelectedCategoryId(category.id);
              setShowItemForm(true);
            }}
          />
        ))}

        {menu.categories.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No hay categorías en el menú</p>
            <button
              onClick={() => {
                setEditingCategory(null);
                setShowCategoryForm(true);
              }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <FiPlus className="h-5 w-5" />
              Añadir la primera categoría
            </button>
          </div>
        )}
      </div>

      {showCategoryForm && (
        <CategoryForm
          initialData={editingCategory || undefined}
          onSubmit={(data) => {
            if (editingCategory) {
              handleUpdateCategory(editingCategory.id, data);
            } else {
              handleAddCategory(data);
            }
          }}
          onCancel={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
          loading={loading}
        />
      )}

      {showItemForm && (
        <ItemForm
          initialData={editingItem?.item}
          onSubmit={(data) => {
            if (editingItem) {
              handleUpdateItem(editingItem.categoryId, editingItem.item.id, data);
            } else if (selectedCategoryId) {
              handleAddItem(selectedCategoryId, data);
            }
          }}
          onCancel={() => {
            setShowItemForm(false);
            setEditingItem(null);
            setSelectedCategoryId(null);
          }}
          loading={loading}
        />
      )}
    </div>
  );
} 