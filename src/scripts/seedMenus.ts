import { doc, collection, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase/firebase';
import { MenuItem } from '../lib/types/auth';

const defaultImage = '/assets/images/defaults/default-review-image.jpg';

const sampleMenus: Partial<MenuItem>[] = [
  // Menú para La Bella Italia
  {
    restaurantId: 'rest1',
    name: 'Pasta Carbonara',
    description: 'Pasta fresca con salsa cremosa de huevo, queso pecorino, panceta y pimienta negra',
    price: 15.99,
    category: 'Pasta',
    tags: ['Popular', 'Clásico'],
    dietaryInfo: ['Contiene gluten', 'Contiene lácteos'],
    images: [
      defaultImage,
      defaultImage
    ],
    isAvailable: true,
    ratings: {
      average: 4.8,
      count: 45
    }
  },
  {
    restaurantId: 'rest1',
    name: 'Pizza Margherita',
    description: 'Pizza tradicional con salsa de tomate, mozzarella fresca y albahaca',
    price: 13.99,
    category: 'Pizza',
    tags: ['Vegetariano', 'Clásico'],
    dietaryInfo: ['Contiene gluten', 'Contiene lácteos'],
    images: [
      defaultImage,
      defaultImage
    ],
    isAvailable: true,
    ratings: {
      average: 4.5,
      count: 38
    }
  },
  // Menú para Sakura Sushi
  {
    restaurantId: 'rest2',
    name: 'Dragon Roll',
    description: 'Roll de tempura de langostino, aguacate y salsa de anguila',
    price: 18.99,
    category: 'Rolls Especiales',
    tags: ['Popular', 'Picante'],
    dietaryInfo: ['Contiene mariscos', 'Contiene gluten'],
    images: [
      defaultImage,
      defaultImage
    ],
    isAvailable: true,
    ratings: {
      average: 4.9,
      count: 62
    }
  },
  {
    restaurantId: 'rest2',
    name: 'Nigiri Variado',
    description: 'Selección de 8 piezas de nigiri con pescado fresco del día',
    price: 24.99,
    category: 'Nigiri',
    tags: ['Fresco', 'Premium'],
    dietaryInfo: ['Contiene pescado crudo'],
    images: [
      defaultImage,
      defaultImage
    ],
    isAvailable: true,
    ratings: {
      average: 4.7,
      count: 33
    }
  },
  // Menú para Taco Loco
  {
    restaurantId: 'rest3',
    name: 'Tacos al Pastor',
    description: 'Tres tacos de cerdo marinado con piña, cebolla y cilantro',
    price: 9.99,
    category: 'Tacos',
    tags: ['Popular', 'Picante'],
    dietaryInfo: ['Contiene carne'],
    images: [
      defaultImage,
      defaultImage
    ],
    isAvailable: true,
    ratings: {
      average: 4.6,
      count: 85
    }
  },
  {
    restaurantId: 'rest3',
    name: 'Guacamole Fresco',
    description: 'Guacamole preparado al momento con totopos caseros',
    price: 7.99,
    category: 'Entradas',
    tags: ['Vegetariano', 'Fresco'],
    dietaryInfo: ['Vegano', 'Sin gluten'],
    images: [
      defaultImage,
      defaultImage
    ],
    isAvailable: true,
    ratings: {
      average: 4.4,
      count: 41
    }
  }
];

export async function seedMenus() {
  try {
    console.log('Creating menu items...');
    for (const menuItem of sampleMenus) {
      const menuRef = doc(collection(db, 'menuItems'));
      await setDoc(menuRef, {
        ...menuItem,
        id: menuRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log(`Created menu item: ${menuItem.name}`);
    }
    console.log('All menu items created successfully!');
  } catch (error) {
    console.error('Error seeding menu data:', error);
    throw error;
  }
} 