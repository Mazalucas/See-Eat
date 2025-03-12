export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image?: string;
  allergens?: string[];
  isAvailable: boolean;
  order: number;
  options?: {
    name: string;
    choices: {
      name: string;
      price?: number;
    }[];
  }[];
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  order: number;
}

export interface RestaurantMenu {
  restaurantId: string;
  slug: string;
  categories: MenuCategory[];
  items: MenuItem[];
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    logoUrl?: string;
  };
  settings?: {
    showPrices: boolean;
    showImages: boolean;
    allowOrdering: boolean;
  };
  updatedAt: Date;
}

export type DietaryTag = 
  | 'Vegetarian'
  | 'Vegan'
  | 'Gluten-Free'
  | 'Dairy-Free'
  | 'Halal'
  | 'Kosher'
  | 'Low-Carb'
  | 'Keto'
  | 'Paleo';

export type AllergenTag =
  | 'Milk'
  | 'Eggs'
  | 'Fish'
  | 'Shellfish'
  | 'Tree Nuts'
  | 'Peanuts'
  | 'Wheat'
  | 'Soy'
  | 'Sesame';

export type MenuItemStatus = 'available' | 'unavailable' | 'out_of_stock'; 