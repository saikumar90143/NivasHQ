"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { toggleFavoriteAction, checkIsFavoritedAction } from "@/actions/favorite.actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  propertyId: string;
  className?: string;
  iconClassName?: string;
  children?: React.ReactNode;
}

export default function FavoriteButton({ propertyId, className, iconClassName, children }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkIsFavoritedAction(propertyId);
      setIsFavorited(status);
      setIsLoading(false);
    };
    checkStatus();
  }, [propertyId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic UI update
    const previousState = isFavorited;
    setIsFavorited(!isFavorited);

    const res = await toggleFavoriteAction(propertyId);
    if (!res.success) {
      // Rollback on error
      setIsFavorited(previousState);
      toast.error(res.error || "Failed to save property");
    } else {
      if (res.isFavorited) {
        toast.success("Property saved to favorites!");
      } else {
        toast.success("Property removed from favorites.");
      }
    }
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "p-2 rounded-full transition bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 shadow-sm disabled:opacity-50",
        className
      )}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart 
        className={cn(
          "h-5 w-5 transition-colors", 
          isFavorited ? "fill-red-500 text-red-500" : "text-gray-500 hover:text-red-500",
          iconClassName
        )} 
      />
      {children}
    </button>
  );
}
