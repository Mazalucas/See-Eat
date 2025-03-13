'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getMenuByRestaurantId, updateMenu } from '@/lib/firebase/menuUtils';
import { getRestaurantProfile } from '@/lib/firebase/restaurantUtils';
import { Menu } from '@/lib/types/menu';
import MenuBuilder from '@/app/components/restaurant/menu/MenuBuilder';

interface MenuSetupPageProps {
  params: {
    id: string;
  };
}

export default function MenuSetupPage({ params }: MenuSetupPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user) {
          router.push('/auth/login');
          return null;
        }

        // Verificar que el usuario es propietario del restaurante
        const restaurant = await getRestaurantProfile(params.id);
        if (!restaurant || restaurant.ownerId !== user.id) {
          setError('No tienes permiso para editar este menú');
          return;
        }

        // Cargar el menú existente o crear uno nuevo
        const existingMenu = await getMenuByRestaurantId(params.id);
        if (existingMenu) {
          setMenu(existingMenu);
        } else {
          setMenu({
            id: `menu-${Date.now()}`,
            restaurantId: params.id,
            categories: [],
            lastUpdated: new Date().toISOString(),
            version: 1,
            status: 'draft',
            currency: 'EUR',
            languageCode: 'es',
          });
        }
      } catch (err) {
        console.error('Error loading menu:', err);
        setError('Error al cargar el menú');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, router, params.id]);

  const handleSave = async (updatedMenu: Menu) => {
    try {
      setSaving(true);
      await updateMenu(updatedMenu);
      router.refresh();
    } catch (err) {
      console.error('Error saving menu:', err);
      setError('Error al guardar el menú');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700"
        >
          Volver
        </button>
      </div>
    );
  }

  if (!menu) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MenuBuilder
        initialMenu={menu}
        onSave={handleSave}
        loading={saving}
      />
    </div>
  );
} 