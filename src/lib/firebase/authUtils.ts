import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, RestaurantProfile, ClientProfile, AdminProfile } from '../types/auth';

// Sign up a new user
export async function signUp(
  email: string,
  password: string,
  userData: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>
): Promise<UserProfile> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      role: userData.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', user.uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update display name in Firebase Auth
    await updateProfile(user, {
      displayName: userData.displayName,
      photoURL: userData.photoURL,
    });

    return userProfile;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

// Sign in
export async function signIn(email: string, password: string): Promise<UserProfile> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }

    return {
      ...userDoc.data(),
      uid: user.uid,
      createdAt: userDoc.data().createdAt?.toDate(),
      updatedAt: userDoc.data().updatedAt?.toDate(),
    } as UserProfile;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

// Sign out
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Reset password
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}

// Get user profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      return null;
    }

    return {
      ...userDoc.data(),
      uid,
      createdAt: userDoc.data().createdAt?.toDate(),
      updatedAt: userDoc.data().updatedAt?.toDate(),
    } as UserProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

// Update user profile
export async function updateUserProfile(
  uid: string,
  updates: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // Update display name and photo URL in Firebase Auth if provided
    const currentUser = auth.currentUser;
    if (currentUser && (updates.displayName || updates.photoURL)) {
      await updateProfile(currentUser, {
        displayName: updates.displayName,
        photoURL: updates.photoURL,
      });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Create or update restaurant profile
export async function updateRestaurantProfile(
  uid: string,
  updates: Partial<Omit<RestaurantProfile, 'uid' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      role: 'restaurant',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating restaurant profile:', error);
    throw error;
  }
}

// Create or update client profile
export async function updateClientProfile(
  uid: string,
  updates: Partial<Omit<ClientProfile, 'uid' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      role: 'client',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating client profile:', error);
    throw error;
  }
}

// Create or update admin profile
export async function updateAdminProfile(
  uid: string,
  updates: Partial<Omit<AdminProfile, 'uid' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      role: 'admin',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    throw error;
  }
} 