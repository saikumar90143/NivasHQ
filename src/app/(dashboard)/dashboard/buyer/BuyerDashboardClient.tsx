"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cancelSiteVisitAction } from "@/actions/lead.actions";
import { toast } from "sonner";
import { Heart, Calendar, MapPin, X } from "lucide-react";

export default function BuyerDashboardClient({ initialFavorites, initialAppointments }: { initialFavorites: any[], initialAppointments: any[] }) {
  const [appointments, setAppointments] = useState(initialAppointments);

  const handleCancelAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this site visit?")) return;
    
    const res = await cancelSiteVisitAction(id);
    if (res.success) {
      toast.success("Site visit cancelled successfully");
      setAppointments(appointments.map(a => a.id === id ? { ...a, status: "CANCELLED" } : a));
    } else {
      toast.error(res.error || "Failed to cancel");
    }
  };

  return (
    <Tabs defaultValue="favorites" className="w-full">
      <TabsList className="mb-8 bg-gray-100 p-1 rounded-lg">
        <TabsTrigger value="favorites" className="data-[state=active]:bg-white data-[state=active]:text-[#0f172a] rounded-md px-6 py-2">
          Saved Properties ({initialFavorites.length})
        </TabsTrigger>
        <TabsTrigger value="appointments" className="data-[state=active]:bg-white data-[state=active]:text-[#0f172a] rounded-md px-6 py-2">
          Site Visits ({appointments.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="favorites">
        {initialFavorites.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Heart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No saved properties</h3>
            <p className="text-gray-500 mt-1">Properties you favorite will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialFavorites.map((fav) => (
              <div key={fav.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm group">
                <Link href={`/properties/${fav.property.slug}`}>
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image 
                      src={fav.property.images?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'} 
                      alt={fav.property.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{fav.property.title}</h3>
                    <p className="text-[#d4a853] font-bold">₹{(Number(fav.property.price) / 100000).toFixed(2)} Lacs</p>
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                      <MapPin size={14} /> {fav.property.locality?.name}, {fav.property.city?.name}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="appointments">
        {appointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No site visits scheduled</h3>
            <p className="text-gray-500 mt-1">Your requested property tours will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 relative rounded-lg overflow-hidden shrink-0">
                    <Image 
                      src={apt.property?.images?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'} 
                      alt="Property" 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{apt.property?.title || "Property"}</h3>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                      <Calendar size={14} className="text-[#d4a853]" />
                      {new Date(apt.scheduledDate).toLocaleDateString()} at {apt.scheduledTime}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        apt.status === 'REQUESTED' ? 'bg-yellow-100 text-yellow-800' :
                        apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        apt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {apt.status}
                      </span>
                      {apt.agent?.user?.name && (
                        <span className="text-xs text-gray-500">Agent: {apt.agent.user.name}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-auto">
                  {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                    <Button 
                      variant="outline" 
                      className="w-full md:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => handleCancelAppointment(apt.id)}
                    >
                      <X size={16} className="mr-2" /> Cancel Visit
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
