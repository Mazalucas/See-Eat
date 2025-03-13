import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { seedMenus } from './seedMenus';
import { seedRestaurants } from './seedRestaurants';
import { seedReviews } from './seedReviews';

const firebaseConfig = {
  apiKey: "AIzaSyCGYRI4jdKhq22g_cpCeeSc2y6n_z663w8",
  authDomain: "see-eat-53aea.firebaseapp.com",
  projectId: "see-eat-53aea",
  storageBucket: "see-eat-53aea.firebasestorage.app",
  messagingSenderId: "735037793209",
  appId: "1:735037793209:web:fd8283bfc49ac4516c4c68",
  measurementId: "G-HM8PYJZMJ5"
};

// Initialize Firebase
initializeApp(firebaseConfig);

async function seed() {
  try {
    console.log('Starting seeding process...');
    
    console.log('\nSeeding restaurants...');
    await seedRestaurants();
    
    console.log('\nCreating menus...');
    await seedMenus();
    
    console.log('\nSeeding reviews...');
    await seedReviews();
    
    console.log('\nSeeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed(); 