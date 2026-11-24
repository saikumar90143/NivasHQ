import { Metadata } from "next";
import { db } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  MapPin, Calendar, CheckCircle, Share2, Heart, 
  Building2, KeySquare
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Project Details | NivasaHQ",
  description: "View project details, master plans, and contact the builder.",
};

// Mock detailed data
const mockProjectData = {
  id: "proj-1",
  title: "Prestige High Fields",
  slug: "prestige-high-fields",
  description: "Prestige High Fields is an expansive residential project that offers a lifestyle of comfort and luxury. Situated in the heart of Gachibowli, it features meticulously designed apartments with state-of-the-art amenities including a massive clubhouse, sports facilities, and beautifully landscaped gardens. The project is strategically located close to the Financial District and major IT hubs, making it an ideal choice for professionals.",
  startingPrice: "₹1.5 Cr",
  maxPrice: "₹3.5 Cr",
  location: "Gachibowli, Hyderabad",
  status: "ACTIVE",
  possessionStatus: "Ready to Move",
  totalUnits: 1200,
  availableUnits: 45,
  totalTowers: 10,
  totalFloors: 35,
  reraNumber: "P02400000000",
  reraApproved: true,
  launchDate: "Jan 2018",
  images: [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  ],
  builder: {
    name: "Prestige Group",
    establishedYear: 1986,
    totalProjects: 150,
    logoUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=150&q=80"
  },
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  let project: any = null;
  const resolvedParams = await params;

  try {
    const dbProject = await db.project.findUnique({
      where: { slug: resolvedParams.slug },
      include: {
        locality: true,
        city: true,
        builder: {
          include: { user: true }
        }
      }
    });

    if (dbProject) {
      project = {
        id: dbProject.id,
        title: dbProject.title,
        slug: dbProject.slug,
        description: dbProject.description,
        startingPrice: `₹${(Number(dbProject.startingPrice) / 10000000).toFixed(2)} Cr`,
        maxPrice: `₹${(Number(dbProject.maxPrice) / 10000000).toFixed(2)} Cr`,
        location: `${dbProject.locality?.name}, ${dbProject.city?.name}`,
        status: dbProject.status,
        possessionStatus: dbProject.possessionStatus?.replace(/_/g, ' ') || 'Upcoming',
        totalUnits: dbProject.totalUnits || 0,
        availableUnits: dbProject.availableUnits || 0,
        totalTowers: dbProject.totalTowers || 0,
        totalFloors: dbProject.totalFloors || 0,
        reraNumber: dbProject.reraNumber || 'N/A',
        reraApproved: dbProject.reraApproved,
        launchDate: dbProject.launchDate ? new Date(dbProject.launchDate).toLocaleDateString() : 'N/A',
        images: mockProjectData.images, // Mock images for prototype
        builder: {
          name: dbProject.builder?.companyName || "Verified Builder",
          establishedYear: dbProject.builder?.establishedYear || 2000,
          totalProjects: dbProject.builder?.totalProjects || 1,
          logoUrl: dbProject.builder?.logoUrl || mockProjectData.builder.logoUrl
        }
      };
    }
  } catch (error) {
    console.warn("Database connection failed, using mock project data.", error);
  }

  // Fallback to mock data if DB fails or project not found
  if (!project) {
    project = mockProjectData;
  }

  if (!project) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      {/* Project Gallery */}
      <div className="container mx-auto px-4 mb-8 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[400px] md:h-[500px]">
          <div className="md:col-span-2 relative h-full">
            <Image 
              src={project.images[0]} 
              alt="Primary Image" 
              fill 
              className="object-cover hover:scale-105 transition-transform duration-700" 
              priority
            />
            <div className="absolute top-4 left-4">
              <span className="bg-[#0f172a] text-white px-4 py-2 rounded-lg font-bold shadow-lg">Project</span>
            </div>
          </div>
          <div className="hidden md:grid grid-rows-2 gap-2">
            <div className="relative h-full">
              <Image src={project.images[1]} alt="Image 2" fill className="object-cover" />
            </div>
            <div className="relative h-full">
              <Image src={project.images[2]} alt="Image 3" fill className="object-cover" />
            </div>
          </div>
          <div className="hidden md:block relative h-full">
            <Image src={project.images[3]} alt="Image 4" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition">
              <span className="text-white font-bold text-lg">+8 Photos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="w-full lg:w-2/3 space-y-8">
            
            {/* Header */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold text-[#0f172a] mb-2">
                    {project.title}
                  </h1>
                  <p className="text-gray-600 flex items-center gap-1.5 text-lg mb-4">
                    <MapPin size={18} /> {project.location}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {project.possessionStatus}
                    </span>
                    {project.reraApproved && (
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <CheckCircle size={14} /> RERA Approved
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-left md:text-right bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-sm text-gray-500 font-medium mb-1">Project Price Range</div>
                  <div className="text-2xl md:text-3xl font-bold text-[#d4a853]">
                    {project.startingPrice} - {project.maxPrice}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <Button variant="outline" className="flex-1 md:flex-none flex items-center gap-2">
                  <Share2 size={16} /> Share Project
                </Button>
                <Button variant="outline" className="flex-1 md:flex-none flex items-center gap-2">
                  <Heart size={16} /> Save
                </Button>
              </div>
            </div>

            {/* Key Details Grid */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#0f172a] mb-6">Project Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm mb-1 flex items-center gap-1.5"><Building2 size={16} /> Total Units</span>
                  <span className="font-semibold text-lg text-gray-800">{project.totalUnits}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm mb-1 flex items-center gap-1.5"><KeySquare size={16} /> Available</span>
                  <span className="font-semibold text-lg text-green-600">{project.availableUnits}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm mb-1">Towers</span>
                  <span className="font-semibold text-lg text-gray-800">{project.totalTowers}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm mb-1">Floors</span>
                  <span className="font-semibold text-lg text-gray-800">{project.totalFloors}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm mb-1 flex items-center gap-1.5"><Calendar size={16} /> Launch Date</span>
                  <span className="font-semibold text-lg text-gray-800">{project.launchDate}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm mb-1">RERA Number</span>
                  <span className="font-semibold text-sm text-gray-800 bg-gray-100 px-2 py-1 rounded inline-block w-fit mt-1">{project.reraNumber}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#0f172a] mb-4">About the Project</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>

          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-1/3 space-y-6">
            
            {/* Contact Builder Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-[#0f172a] mb-6">Developed By</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                  <Image src={project.builder.logoUrl} alt={project.builder.name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">{project.builder.name}</h4>
                  <p className="text-gray-500 text-sm">Est. {project.builder.establishedYear}</p>
                  <p className="text-indigo-600 text-sm font-medium mt-1">{project.builder.totalProjects} Projects Delivered</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button className="w-full bg-[#0f172a] hover:bg-[#0f172a]/90 text-white font-semibold py-6">
                  Contact Developer
                </Button>
                <Button variant="outline" className="w-full font-semibold py-6 border-[#0f172a] text-[#0f172a] hover:bg-gray-50">
                  Download Brochure
                </Button>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
