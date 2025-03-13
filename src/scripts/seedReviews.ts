import { doc, collection, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase/firebase';
import { Review } from '../lib/types/auth';

const defaultImage = '/assets/images/defaults/default-review-image.jpg';

const sampleReviews: Partial<Review>[] = [
  {
    userId: '42KbxvQM1YS1pWHI2iFRiFY3SQp2', // Tu ID de usuario
    restaurantId: 'rest1',
    restaurantName: 'La Bella Italia',
    restaurantImage: defaultImage,
    rating: 4.5,
    comment: '¡Excelente comida italiana! La pasta estaba perfectamente al dente y la salsa era deliciosa. El servicio fue muy atento.',
    images: [defaultImage],
    likes: 5
  },
  {
    userId: '42KbxvQM1YS1pWHI2iFRiFY3SQp2',
    restaurantId: 'rest2',
    restaurantName: 'Sakura Sushi',
    restaurantImage: defaultImage,
    rating: 5,
    comment: 'El mejor sushi que he probado en la ciudad. Los rolls son creativos y el pescado muy fresco. ¡Definitivamente volveré!',
    images: [defaultImage],
    likes: 8
  },
  {
    userId: '42KbxvQM1YS1pWHI2iFRiFY3SQp2',
    restaurantId: 'rest3',
    restaurantName: 'Taco Loco',
    restaurantImage: defaultImage,
    rating: 4,
    comment: 'Tacos auténticos y muy sabrosos. El ambiente es casual y divertido. Los precios son razonables.',
    images: [defaultImage],
    likes: 3
  }
];

export async function seedReviews() {
  try {
    for (const review of sampleReviews) {
      const reviewRef = doc(collection(db, 'reviews'));
      await setDoc(reviewRef, {
        ...review,
        id: reviewRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log(`Created review for ${review.restaurantName}`);
    }
    console.log('All reviews created successfully!');
  } catch (error) {
    console.error('Error seeding reviews:', error);
    throw error;
  }
} 