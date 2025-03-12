'use client';

import Image from 'next/image';
import { useState } from 'react';
import { MenuItem as MenuItemType } from '@/lib/types/auth';
import { FaStar, FaHeart } from 'react-icons/fa';
import { MdRestaurantMenu } from 'react-icons/md';

interface MenuItemProps {
  item: MenuItemType;
  onFavorite?: (itemId: string) => void;
  isFavorited?: boolean;
}

export default function MenuItem({ item, onFavorite, isFavorited = false }: MenuItemProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(item.images[0] || '');

  const handleImageError = () => {
    setSelectedImage('/images/placeholder-food.jpg');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-video w-full">
        <Image
          src={selectedImage}
          alt={item.name}
          fill
          className={`object-cover transition-opacity duration-300 ${
            isImageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setIsImageLoading(false)}
          onError={handleImageError}
        />
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <MdRestaurantMenu className="w-12 h-12 text-gray-400 animate-pulse" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
          <span className="text-lg font-bold text-green-600">
            ${item.price.toFixed(2)}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3">{item.description}</p>

        <div className="flex flex-wrap gap-2 mb-3">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <FaStar className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-600">
              {item.ratings.average.toFixed(1)} ({item.ratings.count})
            </span>
          </div>

          {onFavorite && (
            <button
              onClick={() => onFavorite(item.id)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <FaHeart
                className={`w-5 h-5 ${
                  isFavorited ? 'text-red-500' : 'text-gray-400'
                }`}
              />
            </button>
          )}
        </div>

        {!item.isAvailable && (
          <div className="mt-2 py-1 px-2 bg-red-100 text-red-600 text-sm rounded text-center">
            Currently Unavailable
          </div>
        )}
      </div>
    </div>
  );
} 