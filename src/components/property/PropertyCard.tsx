"use client";

import Image from 'next/image';
import { MapPin, CheckCircle } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import CompareCheckbox from '../compare/CompareCheckbox';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface PropertyCardProps {
  id: string;
  title: string;
  price: string;
  type: string;
  bhk: number;
  area: string;
  location: string;
  imageUrl: string;
  verified?: boolean;
  featured?: boolean;
  listedBy?: 'Owner' | 'Agent' | 'Builder';
  className?: string;
}

export default function PropertyCard({ id, title, price, type, bhk, area, location, imageUrl, verified, featured, listedBy, className }: PropertyCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className={cn("group relative rounded-2xl overflow-hidden border border-white/40 bg-white/60 backdrop-blur-xl shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300", className)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={imageUrl} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
        <div className="absolute top-3 left-3 flex gap-2">
          {featured && <span className="bg-[#d4a853] text-[#0f172a] text-xs font-bold px-2 py-1 rounded">Featured</span>}
          {verified && <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={12}/> Verified</span>}
        </div>
        <div className="absolute top-12 left-3 z-10">
          <CompareCheckbox property={{ id, title, price, imageUrl }} />
        </div>
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton propertyId={id} />
        </div>
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-sm font-semibold shadow-sm">
          {type}
        </div>
        {listedBy && (
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur text-white text-xs font-medium px-2 py-1 rounded shadow-sm border border-white/10">
            {listedBy === 'Owner' ? 'Direct Owner' : listedBy === 'Agent' ? 'Agent' : 'Builder'}
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-slate-900">{price}</h3>
          <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{bhk} BHK • {area}</span>
        </div>
        <h4 className="font-semibold text-slate-800 mb-2 truncate text-lg group-hover:text-indigo-600 transition-colors">{title}</h4>
        <div className="flex items-center text-slate-500 text-sm mb-5 font-medium">
          <MapPin size={16} className="mr-1.5 text-indigo-400" /> {location}
        </div>
        
        <div className="grid grid-cols-2 gap-3 opacity-90 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300">
          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20"
          >
            View Details
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white border-2 border-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-semibold hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
          >
            Enquire
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
