import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, CustomerProfile, RestaurantProfile, AdminProfile, Review } from '../types/auth';

const USERS_COLLECTION = 'users';

interface FirestoreUser extends Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const convertToUserProfile = (id: string, data: DocumentData): UserProfile => {
  const { createdAt, updatedAt, role, ...rest } = data;
  
  const baseProfile = {
    uid: id,
    ...rest,
    role,
    createdAt: createdAt.toDate().toISOString(),
    updatedAt: updatedAt.toDate().toISOString(),
  };

  switch (role) {
    case 'customer':
      return {
        ...baseProfile,
        role: 'customer',
        dietaryPreferences: rest.dietaryPreferences || [],
        favoriteRestaurants: rest.favoriteRestaurants || [],
        favoriteItems: rest.favoriteItems || [],
        reviews: rest.reviews || [],
      } as CustomerProfile;
    
    case 'restaurant':
      return {
        ...baseProfile,
        role: 'restaurant',
        restaurantId: rest.restaurantId,
        cuisine: rest.cuisine || [],
        address: rest.address,
        phone: rest.phone,
        website: rest.website,
        schedule: rest.schedule || {},
        status: rest.status || 'pending',
      } as RestaurantProfile;
    
    case 'admin':
      return {
        ...baseProfile,
        role: 'admin',
        permissions: rest.permissions || [],
      } as AdminProfile;
    
    default:
      throw new Error(`Invalid user role: ${role}`);
  }
};

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    return convertToUserProfile(userDoc.id, userDoc.data());
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw new Error('Failed to get user profile');
  }
}

export async function updateUserProfile(
  userId: string,
  userData: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<UserProfile> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // Get current user data to ensure we're not changing the role
    const currentUser = await getDoc(userRef);
    if (!currentUser.exists()) {
      throw new Error('User profile not found');
    }
    
    const currentData = currentUser.data();
    const updateData = {
      ...userData,
      role: currentData.role, // Preserve the original role
      updatedAt: serverTimestamp(),
    };

    await updateDoc(userRef, updateData);
    
    // Get the updated document
    const updatedDoc = await getDoc(userRef);
    const data = updatedDoc.data();
    
    if (!updatedDoc.exists() || !data) {
      throw new Error('User profile not found');
    }

    return convertToUserProfile(userId, data);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
}

export async function createUserProfile(
  userId: string,
  userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<UserProfile> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const now = serverTimestamp();
    const userProfile = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(userRef, userProfile);
    
    // Get the updated document
    const newDoc = await getDoc(userRef);
    const data = newDoc.data();
    
    if (!newDoc.exists() || !data) {
      throw new Error('Failed to create user profile');
    }

    return convertToUserProfile(userId, data);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
}

export async function getUserReviews(userId: string): Promise<Review[]> {
  try {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(reviewsQuery);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Review[];
  } catch (error) {
    console.error('Error getting user reviews:', error);
    return [];
  }
}

export async function createReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'likes'>): Promise<string | null> {
  try {
    const reviewsRef = collection(db, 'reviews');
    const newReview = {
      ...review,
      likes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await setDoc(doc(reviewsRef), newReview);
    return docRef.id;
  } catch (error) {
    console.error('Error creating review:', error);
    return null;
  }
}

export async function updateReview(
  reviewId: string,
  updates: Partial<Omit<Review, 'id' | 'userId' | 'restaurantId' | 'createdAt' | 'updatedAt'>>
): Promise<boolean> {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    await updateDoc(reviewRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating review:', error);
    return false;
  }
}

export async function toggleFavoriteRestaurant(userId: string, restaurantId: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data();
    const favorites = userData.favoriteRestaurants || [];
    const isFavorite = favorites.includes(restaurantId);

    await updateDoc(userRef, {
      favoriteRestaurants: isFavorite
        ? favorites.filter((id: string) => id !== restaurantId)
        : [...favorites, restaurantId],
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error('Error toggling favorite restaurant:', error);
    return false;
  }
}

export async function getFavoriteRestaurants(userId: string): Promise<string[]> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return [];
    }

    return userDoc.data().favoriteRestaurants || [];
  } catch (error) {
    console.error('Error getting favorite restaurants:', error);
    return [];
  }
} 