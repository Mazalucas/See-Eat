export type MenuItemCategory =
  | 'Entradas'
  | 'Sopas'
  | 'Ensaladas'
  | 'Platos Principales'
  | 'Carnes'
  | 'Aves'
  | 'Pescados y Mariscos'
  | 'Pastas'
  | 'Arroces'
  | 'Pizzas'
  | 'Sándwiches'
  | 'Hamburguesas'
  | 'Tacos'
  | 'Sushi'
  | 'Guarniciones'
  | 'Postres'
  | 'Bebidas'
  | 'Cócteles'
  | 'Vinos'
  | 'Cervezas';

export type CuisineTag =
  | 'Mediterránea'
  | 'Italiana'
  | 'Francesa'
  | 'Española'
  | 'Griega'
  | 'Mexicana'
  | 'Tex-Mex'
  | 'Peruana'
  | 'Argentina'
  | 'Brasileña'
  | 'Japonesa'
  | 'China'
  | 'Tailandesa'
  | 'Vietnamita'
  | 'India'
  | 'Coreana'
  | 'Árabe'
  | 'Turca'
  | 'Marroquí'
  | 'Americana'
  | 'Fusión';

export type DietaryInfo =
  | 'Vegetariano'
  | 'Vegano'
  | 'Sin Gluten'
  | 'Sin Lactosa'
  | 'Sin Frutos Secos'
  | 'Bajo en Calorías'
  | 'Bajo en Carbohidratos'
  | 'Alto en Proteínas'
  | 'Bajo en Sodio'
  | 'Sin Azúcar Añadido'
  | 'Orgánico'
  | 'Halal'
  | 'Kosher'
  | 'Paleo'
  | 'Keto'
  | 'Raw'
  | 'Whole30';

export type Allergen =
  | 'Gluten'
  | 'Crustáceos'
  | 'Huevos'
  | 'Pescado'
  | 'Cacahuetes'
  | 'Soja'
  | 'Lácteos'
  | 'Frutos Secos'
  | 'Apio'
  | 'Mostaza'
  | 'Sésamo'
  | 'Sulfitos'
  | 'Moluscos'
  | 'Altramuces';

export type SpicyLevel = 'No Picante' | 'Suave' | 'Medio' | 'Picante' | 'Muy Picante';

export type MenuItemTag =
  | 'Nuevo'
  | 'Popular'
  | 'Chef Recomienda'
  | 'Temporada'
  | 'Plato Estrella'
  | 'Hecho en Casa'
  | 'Local'
  | 'Sostenible'
  | 'Premium'
  | SpicyLevel;

export const MENU_ITEM_CATEGORIES: MenuItemCategory[] = [
  'Entradas',
  'Sopas',
  'Ensaladas',
  'Platos Principales',
  'Carnes',
  'Aves',
  'Pescados y Mariscos',
  'Pastas',
  'Arroces',
  'Pizzas',
  'Sándwiches',
  'Hamburguesas',
  'Tacos',
  'Sushi',
  'Guarniciones',
  'Postres',
  'Bebidas',
  'Cócteles',
  'Vinos',
  'Cervezas'
];

export const CUISINE_TAGS: CuisineTag[] = [
  'Mediterránea',
  'Italiana',
  'Francesa',
  'Española',
  'Griega',
  'Mexicana',
  'Tex-Mex',
  'Peruana',
  'Argentina',
  'Brasileña',
  'Japonesa',
  'China',
  'Tailandesa',
  'Vietnamita',
  'India',
  'Coreana',
  'Árabe',
  'Turca',
  'Marroquí',
  'Americana',
  'Fusión'
];

export const DIETARY_INFO: DietaryInfo[] = [
  'Vegetariano',
  'Vegano',
  'Sin Gluten',
  'Sin Lactosa',
  'Sin Frutos Secos',
  'Bajo en Calorías',
  'Bajo en Carbohidratos',
  'Alto en Proteínas',
  'Bajo en Sodio',
  'Sin Azúcar Añadido',
  'Orgánico',
  'Halal',
  'Kosher',
  'Paleo',
  'Keto',
  'Raw',
  'Whole30'
];

export const ALLERGENS: Allergen[] = [
  'Gluten',
  'Crustáceos',
  'Huevos',
  'Pescado',
  'Cacahuetes',
  'Soja',
  'Lácteos',
  'Frutos Secos',
  'Apio',
  'Mostaza',
  'Sésamo',
  'Sulfitos',
  'Moluscos',
  'Altramuces'
];

export const SPICY_LEVELS: SpicyLevel[] = [
  'No Picante',
  'Suave',
  'Medio',
  'Picante',
  'Muy Picante'
];

export const MENU_ITEM_TAGS: MenuItemTag[] = [
  'Nuevo',
  'Popular',
  'Chef Recomienda',
  'Temporada',
  'Plato Estrella',
  'Hecho en Casa',
  'Local',
  'Sostenible',
  'Premium',
  ...SPICY_LEVELS
];

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  category: MenuItemCategory;
  available: boolean;
  tags: MenuItemTag[];
  cuisineType: CuisineTag[];
  dietaryInfo: DietaryInfo[];
  allergens: Allergen[];
  image: string;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuCategory {
  id: string;
  name: MenuItemCategory;
  description: string;
  order: number;
  items: MenuItem[];
}

export type DietaryTag =
  | 'vegetariano'
  | 'vegano'
  | 'sin_gluten'
  | 'sin_lactosa'
  | 'halal'
  | 'kosher'
  | 'bajo_en_calorias'
  | 'bajo_en_carbohidratos'
  | 'bajo_en_sodio'
  | 'alto_en_proteinas';

export interface MenuOption {
  name: string;
  choices: { name: string; price?: number }[];
}

export type MenuStatus = 'draft' | 'published' | 'archived';

export interface Menu {
  id: string;
  restaurantId: string;
  categories: MenuCategory[];
  lastUpdated: string;
  version: number;
  status: MenuStatus;
  currency: string;
  languageCode: string;
}

export interface MenuTheme {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
}

export interface MenuSettings {
  showPrices: boolean;
  showImages: boolean;
  showAllergens: boolean;
  currency: string;
}

export interface RestaurantMenu {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  categories: MenuCategory[];
  items: MenuItem[];
  theme?: MenuTheme;
  settings?: MenuSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type MenuItemStatus = 'available' | 'unavailable' | 'out_of_stock'; 