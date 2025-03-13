import {
  collection,
  doc,
  getDoc,
  getDocs,
  query as firestoreQuery,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  limit,
  orderBy,
  startAfter,
  type Query,
  type DocumentData,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { RestaurantProfile } from '@/lib/types/auth';

const RESTAURANTS_COLLECTION = 'restaurants';
const DRAFTS_COLLECTION = 'restaurantDrafts';

type FirestoreRestaurantProfile = Omit<RestaurantProfile, 'createdAt' | 'updatedAt'> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export async function getRestaurantProfile(restaurantId: string): Promise<RestaurantProfile | null> {
  try {
    const docRef = doc(db, RESTAURANTS_COLLECTION, restaurantId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as FirestoreRestaurantProfile;
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting restaurant profile:', error);
    throw error;
  }
}

export async function createRestaurantProfile(userId: string, data: Partial<RestaurantProfile>): Promise<string> {
  try {
    const restaurantRef = doc(collection(db, RESTAURANTS_COLLECTION));
    const restaurantData = {
      ...data,
      uid: userId,
      role: 'restaurant',
      status: data.status || 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(restaurantRef, restaurantData);

    // Eliminar el borrador si existe
    await deleteRestaurantDraft(userId);

    return restaurantRef.id;
  } catch (error) {
    console.error('Error creating restaurant profile:', error);
    throw error;
  }
}

export async function updateRestaurantProfile(restaurantId: string, data: Partial<RestaurantProfile>): Promise<void> {
  try {
    const restaurantRef = doc(db, RESTAURANTS_COLLECTION, restaurantId);
    
    // Check if the document exists
    const docSnap = await getDoc(restaurantRef);
    
    if (!docSnap.exists()) {
      throw new Error(`No existe un restaurante con el ID: ${restaurantId}`);
    }

    // Update the existing document
    await updateDoc(restaurantRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating restaurant profile:', error);
    throw error;
  }
}

export async function getRestaurantDraft(userId: string): Promise<Partial<RestaurantProfile> | null> {
  try {
    const docRef = doc(db, DRAFTS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Partial<RestaurantProfile>;
    }

    return null;
  } catch (error) {
    console.error('Error getting restaurant draft:', error);
    throw error;
  }
}

export async function saveRestaurantDraft(userId: string, data: Partial<RestaurantProfile>): Promise<void> {
  try {
    if (!userId) {
      throw new Error('Se requiere un ID de usuario para guardar el borrador');
    }

    console.log('Starting to save restaurant draft for user:', userId);
    console.log('Data to save:', JSON.stringify(data, null, 2));

    const draftRef = doc(db, DRAFTS_COLLECTION, userId);
    
    // Intentar obtener el borrador actual
    let currentDraft = null;
    try {
      currentDraft = await getRestaurantDraft(userId);
      console.log('Current draft:', currentDraft);
    } catch (error) {
      console.warn('No se encontró un borrador existente, creando uno nuevo');
    }

    // Asegurarnos de que los campos requeridos estén presentes
    const draftData = {
      ...(currentDraft || {}),
      ...data,
      uid: userId,
      role: 'restaurant' as const,
      status: data.status || 'pending',
      updatedAt: serverTimestamp(),
    };

    // Si es la primera vez que se guarda, agregar createdAt
    if (!currentDraft) {
      console.log('First time saving draft, adding createdAt');
      draftData.createdAt = serverTimestamp();
    }

    console.log('Final draft data to save:', JSON.stringify(draftData, null, 2));

    // Usar setDoc con merge: true para asegurar que los datos se combinen correctamente
    await setDoc(draftRef, draftData, { merge: true });
    console.log('Draft saved successfully');
  } catch (error) {
    console.error('Error details:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error(`Error al guardar el borrador del restaurante: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

export async function deleteRestaurantDraft(userId: string): Promise<void> {
  try {
    const draftRef = doc(db, DRAFTS_COLLECTION, userId);
    await deleteDoc(draftRef);
  } catch (error) {
    console.error('Error deleting restaurant draft:', error);
    throw error;
  }
}

export async function searchRestaurants(searchQuery: string, lastRestaurant?: RestaurantProfile): Promise<RestaurantProfile[]> {
  try {
    const q = searchQuery.toLowerCase().trim();
    const restaurantsRef = collection(db, RESTAURANTS_COLLECTION);
    
    // Construir la consulta base
    let baseQuery: Query<DocumentData> = firestoreQuery(
      restaurantsRef,
      where('status', '==', 'active'),
      orderBy('restaurantName'),
      limit(10)
    );

    // Si hay un último restaurante, usar paginación
    if (lastRestaurant) {
      baseQuery = firestoreQuery(
        baseQuery,
        startAfter(lastRestaurant.restaurantName)
      );
    }

    const querySnapshot = await getDocs(baseQuery);
    const restaurants: RestaurantProfile[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirestoreRestaurantProfile;
      const restaurant: RestaurantProfile = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };

      // Filtrar por nombre, descripción o tipo de cocina
      if (
        restaurant.restaurantName.toLowerCase().includes(q) ||
        restaurant.description.toLowerCase().includes(q) ||
        restaurant.cuisine.some(c => c.toLowerCase().includes(q))
      ) {
        restaurants.push(restaurant);
      }
    });

    return restaurants;
  } catch (error) {
    console.error('Error searching restaurants:', error);
    throw error;
  }
}

export async function getUserRestaurants(userId: string): Promise<RestaurantProfile[]> {
  try {
    console.log('Fetching restaurants for user:', userId);
    const restaurantsRef = collection(db, RESTAURANTS_COLLECTION);
    const q = firestoreQuery(restaurantsRef, where('uid', '==', userId));
    
    console.log('Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    console.log('Found documents:', querySnapshot.size);
    
    const restaurants = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Restaurant data:', data);
      return {
        ...data,
        uid: doc.id,
        // Convertir timestamps a Date si existen
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
      };
    }) as RestaurantProfile[];

    console.log('Processed restaurants:', restaurants);
    return restaurants;
  } catch (error) {
    console.error('Error fetching user restaurants:', error);
    throw error;
  }
}

export async function deleteRestaurantProfile(restaurantId: string): Promise<void> {
  try {
    const restaurantRef = doc(db, RESTAURANTS_COLLECTION, restaurantId);
    await deleteDoc(restaurantRef);
  } catch (error) {
    console.error('Error deleting restaurant profile:', error);
    throw error;
  }
} 