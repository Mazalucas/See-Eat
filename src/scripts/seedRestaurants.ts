import { createUserProfile } from '../lib/firebase/firebaseUtils.js';
import { RestaurantProfile, DietaryTag } from '../lib/types/auth.js';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase/firebase.js';

const sampleRestaurants: Partial<RestaurantProfile>[] = [
  {
    uid: 'rest1',
    email: 'italiano@example.com',
    displayName: 'La Bella Italia',
    restaurantName: 'La Bella Italia',
    description: 'Auténtica cocina italiana con pasta fresca hecha a diario y pizzas horneadas en horno de leña.',
    address: 'Calle Principal 123, Ciudad',
    phone: '+1234567890',
    website: 'www.labellaitalia.com',
    cuisine: ['Italian'],
    openingHours: {
      monday: { open: '12:00', close: '22:00' },
      tuesday: { open: '12:00', close: '22:00' },
      wednesday: { open: '12:00', close: '22:00' },
      thursday: { open: '12:00', close: '22:00' },
      friday: { open: '12:00', close: '23:00' },
      saturday: { open: '12:00', close: '23:00' },
      sunday: { open: '12:00', close: '21:00' }
    },
    features: ['Terraza', 'Wifi', 'Parking'],
    dietaryOptions: ['Vegetarian', 'Gluten-Free', 'Lactose-Free'],
    isActive: true,
    role: 'restaurant'
  },
  {
    uid: 'rest2',
    email: 'sushi@example.com',
    displayName: 'Sakura Sushi',
    restaurantName: 'Sakura Sushi',
    description: 'El mejor sushi de la ciudad con pescado fresco importado diariamente de Japón.',
    address: 'Avenida Marina 456, Ciudad',
    phone: '+1234567891',
    website: 'www.sakurasushi.com',
    cuisine: ['Japanese'],
    openingHours: {
      monday: { open: '13:00', close: '22:30' },
      tuesday: { open: '13:00', close: '22:30' },
      wednesday: { open: '13:00', close: '22:30' },
      thursday: { open: '13:00', close: '22:30' },
      friday: { open: '13:00', close: '23:30' },
      saturday: { open: '13:00', close: '23:30' },
      sunday: { open: '13:00', close: '22:00' }
    },
    features: ['Barra de Sushi', 'Sake Bar', 'Reservas'],
    dietaryOptions: ['Gluten-Free', 'Lactose-Free'],
    isActive: true,
    role: 'restaurant'
  },
  {
    uid: 'rest3',
    email: 'taco@example.com',
    displayName: 'Taco Loco',
    restaurantName: 'Taco Loco',
    description: 'Auténtica comida mexicana callejera en un ambiente casual y festivo.',
    address: 'Plaza Central 789, Ciudad',
    phone: '+1234567892',
    website: 'www.tacoloco.com',
    cuisine: ['Mexican'],
    openingHours: {
      monday: { open: '11:00', close: '23:00' },
      tuesday: { open: '11:00', close: '23:00' },
      wednesday: { open: '11:00', close: '23:00' },
      thursday: { open: '11:00', close: '23:00' },
      friday: { open: '11:00', close: '02:00' },
      saturday: { open: '11:00', close: '02:00' },
      sunday: { open: '11:00', close: '23:00' }
    },
    features: ['Música en vivo', 'Bar', 'Delivery'],
    dietaryOptions: ['Vegetarian', 'Vegan', 'Gluten-Free'],
    isActive: true,
    role: 'restaurant'
  }
];

export async function seedRestaurants() {
  try {
    for (const restaurant of sampleRestaurants) {
      // Create user profile in 'users' collection
      await createUserProfile(restaurant.uid!, {
        uid: restaurant.uid!,
        email: restaurant.email!,
        displayName: restaurant.displayName!,
        role: 'restaurant'
      });
      
      // Create restaurant profile in 'users' collection with all details
      const userRef = doc(db, 'users', restaurant.uid!);
      await setDoc(userRef, {
        ...restaurant,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      console.log(`Created restaurant: ${restaurant.restaurantName}`);
    }
    console.log('All restaurants created successfully!');
  } catch (error) {
    console.error('Error seeding restaurants:', error);
    throw error; // Re-throw to handle in the main script
  }
} 