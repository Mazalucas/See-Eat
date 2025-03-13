import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase/firebase';

// La ruta debe empezar desde la raíz (carpeta public)
const defaultImage = '/assets/images/defaults/default-review-image.jpg';

export async function updateReviewImages() {
  try {
    console.log('Updating review images...');
    const reviewsRef = collection(db, 'reviews');
    const querySnapshot = await getDocs(reviewsRef);

    for (const docSnapshot of querySnapshot.docs) {
      const reviewData = docSnapshot.data();
      
      // Actualizar la imagen del restaurante y las imágenes de la review
      await updateDoc(doc(db, 'reviews', docSnapshot.id), {
        restaurantImage: defaultImage,
        images: [defaultImage]
      });

      console.log(`Updated images for review: ${docSnapshot.id}`);
    }

    console.log('All review images updated successfully!');
  } catch (error) {
    console.error('Error updating review images:', error);
    throw error;
  }
} 