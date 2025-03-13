import { updateReviewImages } from './updateReviewImages';

async function main() {
  try {
    await updateReviewImages();
    console.log('Data update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating data:', error);
    process.exit(1);
  }
}

main(); 