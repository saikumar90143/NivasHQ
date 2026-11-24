import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Heart, Search, MessageSquare, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PropertyCard from "@/components/property/PropertyCard";

export default async function BuyerDashboardPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  const favoritesCount = await db.favorite.count({ where: { userId: session.user.id } });
  const inquiriesCount = await db.lead.count({ where: { userId: session.user.id } });
  const savedSearchesCount = await db.buyerRequirement.count({ where: { userId: session.user.id } });

  const stats = {
    favoritesCount,
    savedSearchesCount,
    inquiriesCount,
  };

  const favoriteRecords = await db.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      property: {
        include: {
          locality: true,
          city: true,
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 6
  });

  const formatPrice = (priceBigInt: any) => {
    const price = Number(priceBigInt);
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lacs`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Dashboard</h1>
          <p className="text-slate-600 mt-2">Welcome back, {session.user.name}!</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Saved Properties</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.favoritesCount}</div>
              <p className="text-xs text-slate-500 mt-1">Properties you've liked</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Saved Searches</CardTitle>
              <Search className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.savedSearchesCount}</div>
              <p className="text-xs text-slate-500 mt-1">Alerts for new properties</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">My Inquiries</CardTitle>
              <MessageSquare className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inquiriesCount}</div>
              <p className="text-xs text-slate-500 mt-1">Messages sent to agents</p>
            </CardContent>
          </Card>
        </div>

        {favoriteRecords.length > 0 ? (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Favorites</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteRecords.map((record) => {
                const p = record.property;
                return (
                  <Link href={`/properties/${p.slug}`} key={p.id}>
                    <PropertyCard 
                      id={p.id}
                      title={p.title}
                      price={formatPrice(p.price)}
                      type={p.propertyType.replace(/_/g, ' ')}
                      bhk={p.bedrooms || 0}
                      area={`${p.carpetArea || p.builtUpArea || 0} ${p.areaUnit || 'SQFT'}`}
                      location={`${p.locality?.name}, ${p.city?.name}`}
                      imageUrl={p.images?.[0]?.url || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"}
                      verified={p.verificationStatus === 'VERIFIED'}
                      featured={p.isFeatured}
                    />
                  </Link>
                );
              })}
            </div>
            {favoritesCount > 6 && (
              <div className="mt-8 text-center">
                <Button variant="outline">View All Favorites</Button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Home className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No saved properties yet</h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Start exploring properties and click the heart icon to save them here for easy access later.
            </p>
            <Link 
              href="/buy" 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#0f172a] hover:bg-[#0f172a]/90 transition"
            >
              Explore Properties
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
