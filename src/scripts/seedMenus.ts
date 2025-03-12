import { createMenu, updateMenuCategories, updateMenuItems } from '../lib/firebase/menuUtils';
import { MenuCategory, MenuItem } from '../lib/types/menu';

const sampleMenus = [
  {
    restaurantId: 'rest1',
    slug: 'la-bella-italia',
    categories: [
      { id: 'antipasti', name: 'Antipasti', order: 1 },
      { id: 'pasta', name: 'Pasta Fresca', order: 2 },
      { id: 'pizza', name: 'Pizza', order: 3 },
      { id: 'dolci', name: 'Dolci', order: 4 }
    ] as MenuCategory[],
    items: [
      {
        id: 'bruschetta',
        name: 'Bruschetta',
        description: 'Toasted bread with fresh tomatoes, garlic, basil and olive oil',
        price: 8.99,
        categoryId: 'antipasti',
        isAvailable: true,
        order: 1
      },
      {
        id: 'carbonara',
        name: 'Spaghetti Carbonara',
        description: 'Fresh pasta with eggs, pecorino cheese, guanciale and black pepper',
        price: 16.99,
        categoryId: 'pasta',
        isAvailable: true,
        order: 1
      },
      {
        id: 'margherita',
        name: 'Pizza Margherita',
        description: 'Tomato sauce, mozzarella, fresh basil',
        price: 14.99,
        categoryId: 'pizza',
        isAvailable: true,
        order: 1
      }
    ] as MenuItem[]
  },
  {
    restaurantId: 'rest2',
    slug: 'sakura-sushi',
    categories: [
      { id: 'nigiri', name: 'Nigiri', order: 1 },
      { id: 'maki', name: 'Maki Rolls', order: 2 },
      { id: 'special', name: 'Special Rolls', order: 3 },
      { id: 'tempura', name: 'Tempura', order: 4 }
    ] as MenuCategory[],
    items: [
      {
        id: 'salmon-nigiri',
        name: 'Salmon Nigiri',
        description: 'Fresh salmon over seasoned rice',
        price: 6.99,
        categoryId: 'nigiri',
        isAvailable: true,
        order: 1
      },
      {
        id: 'california',
        name: 'California Roll',
        description: 'Crab meat, avocado, cucumber',
        price: 12.99,
        categoryId: 'maki',
        isAvailable: true,
        order: 1
      },
      {
        id: 'dragon',
        name: 'Dragon Roll',
        description: 'Eel, cucumber, topped with avocado',
        price: 16.99,
        categoryId: 'special',
        isAvailable: true,
        order: 1
      }
    ] as MenuItem[]
  },
  {
    restaurantId: 'rest3',
    slug: 'taco-loco',
    categories: [
      { id: 'tacos', name: 'Tacos', order: 1 },
      { id: 'burritos', name: 'Burritos', order: 2 },
      { id: 'quesadillas', name: 'Quesadillas', order: 3 },
      { id: 'sides', name: 'Sides', order: 4 }
    ] as MenuCategory[],
    items: [
      {
        id: 'al-pastor',
        name: 'Tacos Al Pastor',
        description: 'Marinated pork with pineapple, onions and cilantro',
        price: 3.99,
        categoryId: 'tacos',
        isAvailable: true,
        order: 1
      },
      {
        id: 'carne-asada',
        name: 'Burrito Carne Asada',
        description: 'Grilled steak with rice, beans, cheese and pico de gallo',
        price: 11.99,
        categoryId: 'burritos',
        isAvailable: true,
        order: 1
      },
      {
        id: 'queso',
        name: 'Quesadilla de Queso',
        description: 'Melted cheese with your choice of meat',
        price: 9.99,
        categoryId: 'quesadillas',
        isAvailable: true,
        order: 1
      }
    ] as MenuItem[]
  }
];

export async function seedMenus() {
  try {
    for (const menu of sampleMenus) {
      await createMenu(menu.restaurantId, menu.slug);
      await updateMenuCategories(menu.slug, menu.categories);
      await updateMenuItems(menu.slug, menu.items);
      console.log(`Created menu for restaurant: ${menu.slug}`);
    }
    console.log('All menus created successfully!');
  } catch (error) {
    console.error('Error seeding menus:', error);
  }
} 