import { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { MenuItem, RestaurantProfile, Review, UserProfile } from '../types/auth';

// Auth functions
export const logoutUser = () => signOut(auth);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

// Firestore functions
export const addDocument = (collectionName: string, data: any) =>
  addDoc(collection(db, collectionName), data);

export const getDocuments = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateDocument = (collectionName: string, id: string, data: any) =>
  updateDoc(doc(db, collectionName, id), data);

export const deleteDocument = (collectionName: string, id: string) =>
  deleteDoc(doc(db, collectionName, id));

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

// User Management
export const createUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const getUserProfile = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() as UserProfile : null;
};

// Restaurant Management
export const createRestaurantProfile = async (uid: string, data: Partial<RestaurantProfile>) => {
  const restaurantRef = doc(db, 'restaurants', uid);
  await setDoc(restaurantRef, {
    ...data,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const getRestaurantProfile = async (uid: string) => {
  const restaurantRef = doc(db, 'restaurants', uid);
  const restaurantSnap = await getDoc(restaurantRef);
  return restaurantSnap.exists() ? restaurantSnap.data() as RestaurantProfile : null;
};

export const updateRestaurantProfile = async (uid: string, data: Partial<RestaurantProfile>) => {
  const restaurantRef = doc(db, 'restaurants', uid);
  await updateDoc(restaurantRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

// Menu Management
export const createMenuItem = async (restaurantId: string, data: Partial<MenuItem>) => {
  const menuRef = doc(collection(db, 'menuItems'));
  await setDoc(menuRef, {
    ...data,
    id: menuRef.id,
    restaurantId,
    ratings: { average: 0, count: 0 },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return menuRef.id;
};

export const getMenuItem = async (itemId: string) => {
  const menuRef = doc(db, 'menuItems', itemId);
  const menuSnap = await getDoc(menuRef);
  return menuSnap.exists() ? menuSnap.data() as MenuItem : null;
};

export const updateMenuItem = async (itemId: string, data: Partial<MenuItem>) => {
  const menuRef = doc(db, 'menuItems', itemId);
  await updateDoc(menuRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteMenuItem = async (itemId: string) => {
  await deleteDoc(doc(db, 'menuItems', itemId));
};

export const getRestaurantMenu = async (restaurantId: string) => {
  const menuQuery = query(
    collection(db, 'menuItems'),
    where('restaurantId', '==', restaurantId),
    orderBy('category')
  );
  const menuSnap = await getDocs(menuQuery);
  return menuSnap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => doc.data() as MenuItem);
};

// Image Upload
export const uploadMenuImage = async (file: File, restaurantId: string, itemId: string) => {
  const imageRef = ref(storage, `restaurants/${restaurantId}/menu/${itemId}/${file.name}`);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
};

// Reviews
export const createReview = async (data: Partial<Review>) => {
  const reviewRef = doc(collection(db, 'reviews'));
  await setDoc(reviewRef, {
    ...data,
    id: reviewRef.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return reviewRef.id;
};

export const getItemReviews = async (itemId: string, limitCount = 10) => {
  const reviewQuery = query(
    collection(db, 'reviews'),
    where('menuItemId', '==', itemId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const reviewSnap = await getDocs(reviewQuery);
  return reviewSnap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => doc.data() as Review);
};
