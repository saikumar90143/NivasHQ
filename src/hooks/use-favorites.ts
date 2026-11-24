'use client';
import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nivasahq_favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load favorites');
    }
    setIsLoaded(true);
  }, []);

  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId];
      
      try {
        localStorage.setItem('nivasahq_favorites', JSON.stringify(newFavorites));
        // Optional: Sync with backend API here if user is logged in
      } catch (e) {
        console.error('Failed to save favorites');
      }
      
      return newFavorites;
    });
  };

  const isFavorite = (propertyId: string) => {
    return favorites.includes(propertyId);
  };

  return { favorites, toggleFavorite, isFavorite, isLoaded };
}
