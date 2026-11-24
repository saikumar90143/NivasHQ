'use client';
import { useState, useEffect } from 'react';

const MAX_COMPARE = 4;

export function useCompare() {
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nivasahq_compare');
      if (stored) {
        setCompareIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load compare list');
    }
    setIsLoaded(true);
  }, []);

  const saveCompare = (ids: string[]) => {
    try {
      localStorage.setItem('nivasahq_compare', JSON.stringify(ids));
    } catch (e) {
      console.error('Failed to save compare list');
    }
  };

  const addToCompare = (propertyId: string) => {
    setCompareIds(prev => {
      if (prev.includes(propertyId)) return prev;
      if (prev.length >= MAX_COMPARE) {
        // Can't add more than MAX_COMPARE
        // In real app, trigger a toast notification here
        return prev;
      }
      const newList = [...prev, propertyId];
      saveCompare(newList);
      return newList;
    });
  };

  const removeFromCompare = (propertyId: string) => {
    setCompareIds(prev => {
      const newList = prev.filter(id => id !== propertyId);
      saveCompare(newList);
      return newList;
    });
  };

  const clearCompare = () => {
    setCompareIds([]);
    localStorage.removeItem('nivasahq_compare');
  };

  const isInCompare = (propertyId: string) => {
    return compareIds.includes(propertyId);
  };

  return {
    compareIds,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    isLoaded,
    canAddMore: compareIds.length < MAX_COMPARE
  };
}
