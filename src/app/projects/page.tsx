import { Metadata } from "next";
import { db } from "@/lib/db";
import Link from "next/link";
import ProjectCard from "@/components/property/ProjectCard";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

export const metadata: Metadata = {
  title: "New Projects & Developments | NivasaHQ",
  description: "Explore the latest real estate projects, upcoming developments, and new launches by top builders.",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  let projects: any[] = [];
  
  try {
    projects = await db.project.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        locality: true,
        city: true,
        builder: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.warn("Database connection failed", error);
  }

  // Format price helper
  const formatPrice = (price: bigint | null) => {
    if (!price) return 'Price on Request';
    const val = Number(price);
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    return `₹${(val / 100000).toFixed(2)} Lacs`;
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Projects Hero Header */}
        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 mb-8 text-white flex flex-col justify-center items-start shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="grid-pattern-proj" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <rect width="100" height="100" fill="url(#grid-pattern-proj)" />
            </svg>
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">New Projects & Developments</h1>
            <p className="text-slate-300 text-lg max-w-2xl">Discover upcoming and newly launched real estate projects by top builders across the city.</p>
          </div>
        </div>

        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-gray-600 font-medium">Showing {projects.length} new projects</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <SlidersHorizontal size={16} /> Filters
            </Button>
            <select className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#d4a853]">
              <option>Relevance</option>
              <option>Possession: Earliest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        <main className="w-full">
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((proj) => (
                <Link href={`/project/${proj.slug}`} key={proj.id}>
                  <ProjectCard 
                    id={proj.id}
                    title={proj.title}
                    builderName={proj.builder?.companyName || 'Unknown Builder'}
                    startingPrice={formatPrice(proj.startingPrice)}
                    maxPrice={proj.maxPrice ? formatPrice(proj.maxPrice) : undefined}
                    location={`${proj.locality?.name}, ${proj.city?.name}`}
                    imageUrl="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    status={proj.status}
                    possessionStatus={proj.possessionStatus}
                    featured={proj.isFeatured}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed p-12 text-center max-w-2xl mx-auto mt-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2">No projects found</h3>
              <p className="text-slate-500 mb-6">We couldn't find any projects matching your current filters.</p>
              <Link href="/projects">
                <Button>Clear Filters</Button>
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
