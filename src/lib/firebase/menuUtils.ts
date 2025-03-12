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
} from 'firebase/firestore';
import { db } from './firebase';
import { MenuItem, MenuCategory, RestaurantMenu } from '../types/menu';

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

export async function createMenu(restaurantId: string, slug: string): Promise<void> {
  const menuRef = doc(db, 'menus', slug);
  const menu: RestaurantMenu = {
    restaurantId,
    slug,
    categories: [],
    items: [],
    settings: {
      showPrices: true,
      showImages: true,
      allowOrdering: false
    },
    updatedAt: new Date()
  };
  
  await setDoc(menuRef, menu);
}

export async function getMenuBySlug(slug: string): Promise<RestaurantMenu | null> {
  const menuRef = doc(db, 'menus', slug);
  const menuSnap = await getDoc(menuRef);
  
  if (!menuSnap.exists()) {
    return null;
  }
  
  return {
    ...menuSnap.data(),
    updatedAt: menuSnap.data().updatedAt.toDate()
  } as RestaurantMenu;
}

export async function getMenuByRestaurantId(restaurantId: string): Promise<RestaurantMenu | null> {
  const menusRef = collection(db, 'menus');
  const q = query(menusRef, where('restaurantId', '==', restaurantId));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const menuDoc = querySnapshot.docs[0];
  return {
    ...menuDoc.data(),
    updatedAt: menuDoc.data().updatedAt.toDate()
  } as RestaurantMenu;
}

export async function updateMenuCategories(
  slug: string,
  categories: MenuCategory[]
): Promise<void> {
  const menuRef = doc(db, 'menus', slug);
  await updateDoc(menuRef, {
    categories,
    updatedAt: new Date()
  });
}

export async function updateMenuItems(
  slug: string,
  items: MenuItem[]
): Promise<void> {
  const menuRef = doc(db, 'menus', slug);
  await updateDoc(menuRef, {
    items,
    updatedAt: new Date()
  });
}

export async function updateMenuSettings(
  slug: string,
  settings: RestaurantMenu['settings']
): Promise<void> {
  const menuRef = doc(db, 'menus', slug);
  await updateDoc(menuRef, {
    settings,
    updatedAt: new Date()
  });
}

export async function updateMenuTheme(
  slug: string,
  theme: RestaurantMenu['theme']
): Promise<void> {
  const menuRef = doc(db, 'menus', slug);
  await updateDoc(menuRef, {
    theme,
    updatedAt: new Date()
  });
} 