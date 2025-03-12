export type UserRole = 'admin' | 'restaurant' | 'client';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface RestaurantProfile extends UserProfile {
  role: 'restaurant';
  restaurantName: string;
  description: string;
  address: string;
  phone: string;
  website?: string;
  cuisine: string[];
  openingHours: Record<string, { open: string; close: string }>;
  features?: string[];
  isActive: boolean;
}

export interface ClientProfile extends UserProfile {
  role: 'client';
  favorites?: string[]; // Restaurant IDs
  dietary?: string[];
  allergies?: string[];
}

export interface AdminProfile extends UserProfile {
  role: 'admin';
  permissions?: string[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  dietaryInfo: string[];
  images: string[];
  videoUrl?: string;
  isAvailable: boolean;
  restaurantId: string;
  ratings: {
    average: number;
    count: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  menuItemId: string;
  restaurantId: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
} 