import 'dotenv/config';
import { seedRestaurants } from './seedRestaurants.js';
import { seedMenus } from './seedMenus.js';

async function main() {
  console.log('Starting seeding process...');
  
  console.log('\nCreating restaurants...');
  await seedRestaurants();
  
  console.log('\nCreating menus...');
  await seedMenus();
  
  console.log('\nSeeding completed!');
  process.exit(0);
}

main().catch((error) => {
  console.error('Error during seeding:', error);
  process.exit(1);
}); 