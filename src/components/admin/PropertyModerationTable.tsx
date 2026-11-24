"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Check, X, Star, Building } from 'lucide-react';

const formatPrice = (priceStr: string) => {
  const p = Number(priceStr);
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(2)} L`;
  return `₹${p.toLocaleString('en-IN')}`;
};

export default function PropertyModerationTable({ properties: initialProperties }: { properties: any[] }) {
  const [properties, setProperties] = useState(initialProperties);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleAction = async (id: string, action: 'VERIFIED' | 'REJECTED' | 'FEATURE') => {
    setLoading(id);
    const property = properties.find(p => p.id === id);
    const isFeatureAction = action === 'FEATURE';
    
    const payload = isFeatureAction 
      ? { isFeatured: !property.isFeatured }
      : { status: action };

    try {
      const res = await fetch(`/api/admin/properties/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update property');
      }
      
      setProperties(prev => prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            verificationStatus: isFeatureAction ? p.verificationStatus : action,
            status: isFeatureAction ? p.status : (action === 'VERIFIED' ? 'ACTIVE' : 'INACTIVE'),
            isFeatured: isFeatureAction ? !p.isFeatured : p.isFeatured
          };
        }
        return p;
      }));

      toast.success(`Property ${isFeatureAction ? (property.isFeatured ? 'unfeatured' : 'featured') : action.toLowerCase()} successfully`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 bg-black/5 dark:bg-white/5 text-sm uppercase tracking-wider text-muted-foreground">
            <th className="p-5 font-semibold">Property</th>
            <th className="p-5 font-semibold">Agent / Builder</th>
            <th className="p-5 font-semibold">Price & Type</th>
            <th className="p-5 font-semibold">Status</th>
            <th className="p-5 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {properties.map((prop) => (
            <tr key={prop.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
              <td className="p-5">
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground flex items-center gap-2">
                    {prop.title}
                    {prop.isFeatured && (
                      <span className="bg-[#c9932a]/10 text-[#c9932a] text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-gold border border-[#c9932a]/20">
                        <Star className="w-3 h-3 fill-current" /> Featured
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Building className="w-3 h-3" />
                    {prop.locality?.name}, {prop.city?.name || 'City'}
                  </span>
                </div>
              </td>
              <td className="p-5">
                <div className="flex flex-col text-sm">
                  <span className="font-medium text-foreground">
                    {prop.agent?.user?.name || prop.builder?.companyName || prop.owner?.name || 'Unknown'}
                  </span>
                  <span className="text-muted-foreground text-xs uppercase tracking-wider mt-0.5">
                    {prop.agent ? 'Agent' : prop.builder ? 'Builder' : 'Owner'}
                  </span>
                </div>
              </td>
              <td className="p-5">
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground price-display">{formatPrice(prop.price)}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {prop.propertyType.replace(/_/g, ' ')} • {prop.listingType}
                  </span>
                </div>
              </td>
              <td className="p-5">
                <div className="flex flex-col gap-1 items-start">
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                    prop.verificationStatus === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                    prop.verificationStatus === 'REJECTED' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' :
                    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  }`}>
                    {prop.verificationStatus}
                  </span>
                  {prop.status !== 'ACTIVE' && (
                     <span className="text-[10px] font-medium text-muted-foreground uppercase">{prop.status}</span>
                  )}
                </div>
              </td>
              <td className="p-5 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {prop.verificationStatus !== 'VERIFIED' && (
                    <button 
                      onClick={() => handleAction(prop.id, 'VERIFIED')}
                      disabled={loading === prop.id}
                      className="p-2 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full transition-colors disabled:opacity-50"
                      title="Approve Property"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                  {prop.verificationStatus !== 'REJECTED' && (
                    <button 
                      onClick={() => handleAction(prop.id, 'REJECTED')}
                      disabled={loading === prop.id}
                      className="p-2 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full transition-colors disabled:opacity-50"
                      title="Reject Property"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleAction(prop.id, 'FEATURE')}
                    disabled={loading === prop.id}
                    className={`p-2 rounded-full transition-colors disabled:opacity-50 ${prop.isFeatured ? 'bg-[#c9932a]/10 text-[#c9932a] hover:bg-[#c9932a]/20' : 'hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground'}`}
                    title="Toggle Feature"
                  >
                    <Star className={`w-5 h-5 ${prop.isFeatured ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {properties.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-lg font-medium">All caught up!</p>
                  <p className="text-sm">No properties pending moderation.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
