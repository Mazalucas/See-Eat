import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  setDoc,
  writeBatch,
  DocumentData,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Menu, MenuCategory, MenuItem, RestaurantMenu, MenuStatus } from '../types/menu';

const MENUS_COLLECTION = 'menus';

interface FirestoreMenu extends Omit<Menu, 'lastUpdated'> {
  lastUpdated: Timestamp;
}

const convertToMenu = (doc: FirestoreMenu & { id: string }): Menu => ({
  ...doc,
  lastUpdated: doc.lastUpdated.toDate().toISOString(),
});

const convertToFirestoreMenu = (menu: Menu): Omit<FirestoreMenu, 'id'> => ({
  ...menu,
  lastUpdated: Timestamp.fromDate(new Date(menu.lastUpdated)),
});

// Get all menu items for a restaurant
export async function getRestaurantMenu(restaurantId: string): Promise<MenuItem[]> {
  try {
    const menuQuery = query(
      collection(db, 'menuItems'),
      where('restaurantId', '==', restaurantId),
      orderBy('category'),
      orderBy('name')
    );

    const snapshot = await getDocs(menuQuery);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as MenuItem[];
  } catch (error) {
    console.error('Error fetching restaurant menu:', error);
    throw error;
  }
}

// Get a single menu item by ID
export async function getMenuItem(itemId: string): Promise<MenuItem | null> {
  try {
    const docRef = doc(db, 'menuItems', itemId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        ...docSnap.data(),
        id: docSnap.id,
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      } as MenuItem;
    }

    return null;
  } catch (error) {
    console.error('Error fetching menu item:', error);
    throw error;
  }
}

// Add a new menu item
export async function addMenuItem(
  restaurantId: string,
  itemData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'menuItems'), {
      ...itemData,
      restaurantId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding menu item:', error);
    throw error;
  }
}

// Update a menu item
export async function updateMenuItem(
  itemId: string,
  updates: Partial<Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const docRef = doc(db, 'menuItems', itemId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
}

// Delete a menu item
export async function deleteMenuItem(itemId: string): Promise<void> {
  try {
    const docRef = doc(db, 'menuItems', itemId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
}

// Toggle menu item availability
export async function toggleMenuItemAvailability(
  itemId: string,
  isAvailable: boolean
): Promise<void> {
  try {
    const docRef = doc(db, 'menuItems', itemId);
    await updateDoc(docRef, {
      isAvailable,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error toggling menu item availability:', error);
    throw error;
  }
}

// Get menu items by category
export async function getMenuItemsByCategory(
  restaurantId: string,
  category: string
): Promise<MenuItem[]> {
  try {
    const menuQuery = query(
      collection(db, 'menuItems'),
      where('restaurantId', '==', restaurantId),
      where('category', '==', category),
      orderBy('name')
    );

    const snapshot = await getDocs(menuQuery);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as MenuItem[];
  } catch (error) {
    console.error('Error fetching menu items by category:', error);
    throw error;
  }
}

// Search menu items
export async function searchMenuItems(
  restaurantId: string,
  searchTerm: string
): Promise<MenuItem[]> {
  try {
    const menuQuery = query(
      collection(db, 'menuItems'),
      where('restaurantId', '==', restaurantId),
      orderBy('name')
    );

    const snapshot = await getDocs(menuQuery);
    const items = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as MenuItem[];

    // Client-side filtering
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching menu items:', error);
    throw error;
  }
}

export async function getMenu(restaurantId: string): Promise<Menu | null> {
  try {
    const menuRef = doc(db, 'menus', restaurantId);
    const menuDoc = await getDoc(menuRef);

    if (!menuDoc.exists()) {
      return null;
    }

    const menuData = menuDoc.data();
    if (!menuData) {
      return null;
    }

    // Validate required fields
    if (!menuData.restaurantId || !Array.isArray(menuData.categories) || !Array.isArray(menuData.items)) {
      console.error('Invalid menu data structure');
      return null;
    }

    // Convert Firestore Timestamp to Date
    const lastUpdated = menuData.lastUpdated instanceof Timestamp 
      ? menuData.lastUpdated.toDate() 
      : new Date(menuData.lastUpdated);

    // Type assertion after validation
    const menu: Menu = {
      restaurantId: menuData.restaurantId,
      categories: menuData.categories as MenuCategory[],
      items: menuData.items as MenuItem[],
      lastUpdated,
    };

    return menu;
  } catch (error) {
    console.error('Error getting menu:', error);
    return null;
  }
}

export async function getMenuByRestaurantId(restaurantId: string): Promise<Menu | null> {
  try {
    const menusRef = collection(db, MENUS_COLLECTION);
    const q = query(menusRef, where('restaurantId', '==', restaurantId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      lastUpdated: data.lastUpdated.toDate().toISOString(),
    } as Menu;
  } catch (error) {
    console.error('Error getting menu:', error);
    throw new Error('Failed to get menu');
  }
}

export async function createMenu(menu: Omit<Menu, 'id'>): Promise<Menu> {
  try {
    const menusRef = collection(db, MENUS_COLLECTION);
    const menuData = {
      ...menu,
      lastUpdated: serverTimestamp(),
    };
    const docRef = await addDoc(menusRef, menuData);
    const newDoc = await getDoc(docRef);
    
    if (!newDoc.exists()) {
      throw new Error('Failed to create menu');
    }

    const data = newDoc.data();
    return {
      ...data,
      id: newDoc.id,
      lastUpdated: data?.lastUpdated.toDate().toISOString(),
    } as Menu;
  } catch (error) {
    console.error('Error creating menu:', error);
    throw new Error('Failed to create menu');
  }
}

export async function getMenuById(id: string): Promise<RestaurantMenu | null> {
  try {
    const menuDoc = await getDoc(doc(db, 'menus', id));
    if (!menuDoc.exists()) {
      return null;
    }

    const data = menuDoc.data();
    return {
      ...data,
      id: menuDoc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as RestaurantMenu;
  } catch (error) {
    console.error('Error getting menu by ID:', error);
    return null;
  }
}

export async function getMenuBySlug(slug: string): Promise<RestaurantMenu | null> {
  try {
    const menusQuery = query(
      collection(db, 'menus'),
      where('slug', '==', slug)
    );
    
    const querySnapshot = await getDocs(menusQuery);
    if (querySnapshot.empty) {
      return null;
    }

    const menuDoc = querySnapshot.docs[0];
    const data = menuDoc.data();
    return {
      ...data,
      id: menuDoc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as RestaurantMenu;
  } catch (error) {
    console.error('Error getting menu by slug:', error);
    return null;
  }
}

export async function updateMenuCategories(restaurantId: string, categories: MenuCategory[]): Promise<boolean> {
  try {
    const menuRef = doc(db, 'menus', restaurantId);
    const updateData = {
      categories,
      lastUpdated: new Date(),
    };
    await updateDoc(menuRef, updateData);
    return true;
  } catch (error) {
    console.error('Error updating menu categories:', error);
    return false;
  }
}

export async function updateMenuItems(restaurantId: string, items: MenuItem[]): Promise<boolean> {
  try {
    const menuRef = doc(db, 'menus', restaurantId);
    const updateData = {
      items,
      lastUpdated: new Date(),
    };
    await updateDoc(menuRef, updateData);
    return true;
  } catch (error) {
    console.error('Error updating menu items:', error);
    return false;
  }
}

export async function updateMenuSettings(
  slug: string,
  settings: Menu['settings']
): Promise<void> {
  const menuRef = doc(db, 'menus', slug);
  await updateDoc(menuRef, {
    settings,
    updatedAt: new Date()
  });
}

export async function updateMenuTheme(
  slug: string,
  theme: Menu['theme']
): Promise<void> {
  const menuRef = doc(db, 'menus', slug);
  await updateDoc(menuRef, {
    theme,
    updatedAt: new Date()
  });
}

export async function updateMenu(menu: Menu): Promise<Menu> {
  try {
    const menuRef = doc(db, MENUS_COLLECTION, menu.id);
    const menuData = {
      ...menu,
      lastUpdated: serverTimestamp(),
    };
    await updateDoc(menuRef, menuData);
    
    const updatedDoc = await getDoc(menuRef);
    if (!updatedDoc.exists()) {
      throw new Error('Menu not found');
    }

    const data = updatedDoc.data();
    return {
      ...data,
      id: updatedDoc.id,
      lastUpdated: data?.lastUpdated.toDate().toISOString(),
    } as Menu;
  } catch (error) {
    console.error('Error updating menu:', error);
    throw new Error('Failed to update menu');
  }
}

export async function deleteMenu(menuId: string): Promise<void> {
  try {
    const menuRef = doc(db, MENUS_COLLECTION, menuId);
    await deleteDoc(menuRef);
  } catch (error) {
    console.error('Error deleting menu:', error);
    throw new Error('Failed to delete menu');
  }
}

export async function publishMenu(menuId: string): Promise<Menu> {
  try {
    const menuRef = doc(db, MENUS_COLLECTION, menuId);
    await updateDoc(menuRef, {
      status: 'published' as MenuStatus,
      lastUpdated: serverTimestamp(),
    });

    const updatedDoc = await getDoc(menuRef);
    if (!updatedDoc.exists()) {
      throw new Error('Menu not found');
    }

    const data = updatedDoc.data();
    return {
      ...data,
      id: updatedDoc.id,
      lastUpdated: data?.lastUpdated.toDate().toISOString(),
    } as Menu;
  } catch (error) {
    console.error('Error publishing menu:', error);
    throw new Error('Failed to publish menu');
  }
}

export async function archiveMenu(menuId: string): Promise<Menu> {
  try {
    const menuRef = doc(db, MENUS_COLLECTION, menuId);
    await updateDoc(menuRef, {
      status: 'archived' as MenuStatus,
      lastUpdated: serverTimestamp(),
    });

    const updatedDoc = await getDoc(menuRef);
    if (!updatedDoc.exists()) {
      throw new Error('Menu not found');
    }

    const data = updatedDoc.data();
    return {
      ...data,
      id: updatedDoc.id,
      lastUpdated: data?.lastUpdated.toDate().toISOString(),
    } as Menu;
  } catch (error) {
    console.error('Error archiving menu:', error);
    throw new Error('Failed to archive menu');
  }
} 