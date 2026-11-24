import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, CalendarDays } from "lucide-react";

interface ProjectCardProps {
  id: string;
  title: string;
  builderName: string;
  startingPrice: string;
  maxPrice?: string;
  location: string;
  imageUrl: string;
  status: string;
  possessionStatus?: string | null;
  featured?: boolean;
}

export default function ProjectCard({
  title,
  builderName,
  startingPrice,
  maxPrice,
  location,
  imageUrl,
  status,
  possessionStatus,
  featured = false,
}: ProjectCardProps) {
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col h-full cursor-pointer">
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {featured && (
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-none font-semibold">
              FEATURED PROJECT
            </Badge>
          )}
          <Badge className="bg-white/90 text-slate-900 hover:bg-white border-none font-semibold">
            {status.replace(/_/g, ' ')}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-2">
          <p className="text-xs font-semibold text-indigo-600 mb-1 flex items-center gap-1 uppercase tracking-wider">
            <Building2 size={12} /> {builderName}
          </p>
          <h3 className="text-xl font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {title}
          </h3>
        </div>
        
        <p className="text-slate-500 text-sm flex items-center mb-4">
          <MapPin size={14} className="mr-1 text-slate-400 shrink-0" />
          <span className="truncate">{location}</span>
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1">Starting from</p>
            <p className="text-xl font-bold text-slate-900">
              {startingPrice}
              {maxPrice ? <span className="text-sm font-normal text-slate-500"> - {maxPrice}</span> : ''}
            </p>
          </div>
          {possessionStatus && (
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              <CalendarDays size={12} />
              {possessionStatus.replace(/_/g, ' ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
