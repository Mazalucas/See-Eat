'use client';

import { useState, useEffect } from 'react';
import { RestaurantProfile } from '@/lib/types/auth';
import { MenuItem, MenuCategory, MENU_ITEM_CATEGORIES } from '@/lib/types/menu';
import { updateRestaurantProfile } from '@/lib/firebase/restaurantUtils';
import { FaPlus, FaEdit, FaTrash, FaSave, FaUtensils, FaTimes } from 'react-icons/fa';
import MenuItemForm from './MenuItemForm';

interface MenuFormProps {
  restaurant: RestaurantProfile;
  restaurantId: string;
  onUpdate: (updatedData: Partial<RestaurantProfile>) => void;
}

export default function MenuForm({ restaurant, restaurantId, onUpdate }: MenuFormProps) {
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>(
    restaurant.menuCategories || []
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMenuCategories(restaurant.menuCategories || []);
  }, [restaurant.menuCategories]);

  const handleAddCategory = (categoryName: MenuCategory['name']) => {
    const newCategory: MenuCategory = {
      id: Date.now().toString(),
      name: categoryName,
      description: '',
      order: menuCategories.length,
      items: []
    };
    
    const updatedCategories = [...menuCategories, newCategory];
    setMenuCategories(updatedCategories);
    handleSaveCategories(updatedCategories);
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría? Se eliminarán todos los platos en ella.')) return;
    
    const updatedCategories = menuCategories.filter(cat => cat.id !== categoryId);
    setMenuCategories(updatedCategories);
    await handleSaveCategories(updatedCategories);
  };

  const handleAddItem = async (newItem: MenuItem) => {
    if (!selectedCategory) return;

    const updatedCategories = menuCategories.map(category => {
      if (category.id === selectedCategory) {
        return {
          ...category,
          items: [...(category.items || []), { ...newItem, id: Date.now().toString() }]
        };
      }
      return category;
    });

    setMenuCategories(updatedCategories);
    await handleSaveCategories(updatedCategories);
    setIsAddingItem(false);
  };

  const handleUpdateItem = async (updatedItem: MenuItem) => {
    if (!selectedCategory) return;

    const updatedCategories = menuCategories.map(category => {
      if (category.id === selectedCategory) {
        return {
          ...category,
          items: category.items.map(item => 
            item.id === editingItem?.id ? updatedItem : item
          )
        };
      }
      return category;
    });

    setMenuCategories(updatedCategories);
    await handleSaveCategories(updatedCategories);
    setEditingItem(null);
  };

  const handleDeleteItem = async (categoryId: string, itemId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este plato?')) return;

    const updatedCategories = menuCategories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          items: category.items.filter(item => item.id !== itemId)
        };
      }
      return category;
    });

    setMenuCategories(updatedCategories);
    await handleSaveCategories(updatedCategories);
  };

  const handleSaveCategories = async (categories: MenuCategory[]) => {
    setSaving(true);
    try {
      await updateRestaurantProfile(restaurantId, {
        menuCategories: categories
      });
      onUpdate({ menuCategories: categories });
    } catch (error) {
      console.error('Error al guardar el menú:', error);
      alert('Hubo un error al guardar el menú. Por favor, intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con botón de añadir categoría */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión del Menú</h2>
        <button
          type="button"
          onClick={() => setIsAddingCategory(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <FaPlus className="mr-2" />
          Añadir Categoría
        </button>
      </div>

      {menuCategories.length === 0 ? (
        <div className="text-center py-12 bg-white shadow rounded-lg">
          <FaUtensils className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay categorías</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza añadiendo una categoría a tu menú.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsAddingCategory(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <FaPlus className="mr-2" />
              Añadir Categoría
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 space-y-6">
            {menuCategories.map(category => (
              <div key={category.id} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    {category.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setIsAddingItem(true);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FaPlus className="mr-2" />
                      Añadir Plato
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="inline-flex items-center px-2 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items?.map(item => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 bg-gray-50 relative group"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-48 object-cover rounded-md mb-4"
                        />
                      )}
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      <p className="text-lg font-medium text-gray-900 mt-2">
                        ${item.price.toFixed(2)}
                      </p>
                      
                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Dietary Info */}
                      {item.dietaryInfo && item.dietaryInfo.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.dietaryInfo.map(info => (
                            <span
                              key={info}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                            >
                              {info}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Allergens */}
                      {item.allergens && item.allergens.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.allergens.map(allergen => (
                            <span
                              key={allergen}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                            >
                              {allergen}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Status */}
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            item.available
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.available ? 'Disponible' : 'No Disponible'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setEditingItem(item);
                          }}
                          className="p-1 bg-white rounded-full shadow hover:bg-gray-100"
                        >
                          <FaEdit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(category.id, item.id)}
                          className="p-1 bg-white rounded-full shadow hover:bg-gray-100"
                        >
                          <FaTrash className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón de guardar */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => handleSaveCategories(menuCategories)}
          disabled={saving}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            saving ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <FaSave className="mr-2" />
          {saving ? 'Guardando...' : 'Guardar Menú'}
        </button>
      </div>

      {/* Modal para añadir/editar plato */}
      {(isAddingItem || editingItem) && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingItem ? 'Editar Plato' : 'Nuevo Plato'}
            </h3>
            <MenuItemForm
              item={editingItem || undefined}
              categoryId={selectedCategory}
              onSave={editingItem ? handleUpdateItem : handleAddItem}
              onCancel={() => {
                setEditingItem(null);
                setIsAddingItem(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal para añadir categoría */}
      {isAddingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Añadir Categoría
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-900">
                  Selecciona una Categoría
                </label>
                <select
                  id="category"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white"
                  onChange={(e) => handleAddCategory(e.target.value as MenuCategory['name'])}
                  defaultValue=""
                >
                  <option value="" disabled className="text-gray-500">Selecciona una categoría</option>
                  {MENU_ITEM_CATEGORIES.filter(cat => 
                    !menuCategories.some(existing => existing.name === cat)
                  ).map(cat => (
                    <option key={cat} value={cat} className="text-gray-900">{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FaTimes className="mr-2" />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 