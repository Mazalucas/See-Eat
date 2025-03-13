import { MenuItem, MenuCategory } from './menu';

export type UserRole = 'customer' | 'restaurant' | 'admin';

export type DietaryTag = 
  | 'Vegetarian'
  | 'Vegan'
  | 'Gluten-Free'
  | 'Dairy-Free'
  | 'Nut-Free'
  | 'Halal'
  | 'Kosher';

export interface BaseUserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CustomerProfile extends BaseUserProfile {
  role: 'customer';
  dietaryPreferences?: DietaryTag[];
  favoriteRestaurants?: string[];
  favoriteItems?: string[];
  reviews?: string[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface RestaurantProfile extends BaseUserProfile {
  role: 'restaurant';
  restaurantName: string;
  description: string;
  cuisine: string[];
  address: Address;
  phone: string;
  website?: string;
  schedule: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  status: 'pending' | 'active' | 'suspended';
  dietaryOptions?: DietaryTag[];
  features?: string[];
  ratings?: {
    average: number;
    count: number;
  };
  menuCategories?: MenuCategory[];
  menuItems?: MenuItem[];
  reviews?: string[];
}

export interface AdminProfile extends BaseUserProfile {
  role: 'admin';
  permissions: string[];
}

export type UserProfile = CustomerProfile | RestaurantProfile | AdminProfile;

export interface OpeningHours {
  open: string;
  close: string;
}

export interface DailyHours {
  [key: string]: OpeningHours;
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
  restaurantId: string;
  restaurantName: string;
  restaurantImage?: string;
  rating: number;
  comment: string;
  images?: string[];
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

// Type guard para verificar si un perfil es de tipo CustomerProfile
export function isCustomerProfile(profile: UserProfile): profile is CustomerProfile {
  return profile.role === 'customer';
}

// Type guard para verificar si un perfil es de tipo RestaurantProfile
export function isRestaurantProfile(profile: UserProfile): profile is RestaurantProfile {
  return profile.role === 'restaurant';
}

// Type guard para verificar si un perfil es de tipo AdminProfile
export function isAdminProfile(profile: UserProfile): profile is AdminProfile {
  return profile.role === 'admin';
} 