import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PropertyCard from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function UserPropertiesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const properties = await db.property.findMany({
    where: { ownerId: session.user.id },
    include: {
      locality: true,
      city: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-4 sm:p-8 space-y-8 text-foreground max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Properties</h1>
          <p className="text-muted-foreground mt-1">Manage your property listings and view their status.</p>
        </div>
        <Button className="bg-[#d4a853] hover:bg-[#d4a853]/90 text-white" render={<Link href="/list-property" />}>
          <Plus className="h-4 w-4 mr-2" /> List New Property
        </Button>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border border-dashed rounded-xl">
          <h3 className="text-xl font-medium text-slate-700">You haven't listed any properties yet</h3>
          <p className="text-muted-foreground mt-2 mb-6">Start by listing your first property to reach thousands of buyers.</p>
          <Button variant="outline" render={<Link href="/list-property" />}>
            Create your first listing
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((prop) => (
            <PropertyCard
              key={prop.id}
              id={prop.id}
              title={prop.title}
              price={`₹${(Number(prop.price) / 100000).toFixed(2)} Lacs`}
              type={prop.propertyType.replace(/_/g, ' ')}
              bhk={prop.bedrooms || 0}
              area={`${prop.carpetArea} sq.ft`}
              location={`${prop.locality?.name || ''}, ${prop.city?.name || ''}`}
              imageUrl="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
              verified={prop.verificationStatus === 'VERIFIED'}
              featured={prop.isFeatured}
              listedBy={prop.ownerId ? 'Owner' : prop.agentId ? 'Agent' : prop.builderId ? 'Builder' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
