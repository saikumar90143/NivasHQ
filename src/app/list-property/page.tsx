import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import ListPropertyForm from "@/components/property/ListPropertyForm";
import Image from "next/image";

export const metadata: Metadata = {
  title: "List Your Property | NivasaHQ",
  description: "List your property for sale or rent on NivasaHQ.",
};

export default async function ListPropertyPage() {
  const session = await auth();

  // If not logged in, redirect to login page with a callback url
  if (!session || !session.user) {
    redirect("/login?callbackUrl=/list-property");
  }

  // Fetch Cities and Localities for the form dropdowns
  const [cities, localities] = await Promise.all([
    db.location.findMany({
      where: { level: 'CITY' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }),
    db.location.findMany({
      where: { level: 'LOCALITY' },
      select: { id: true, name: true, parentId: true },
      orderBy: { name: 'asc' }
    })
  ]);

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      {/* Split layout: Form on left, value props on right */}
      <div className="container mx-auto px-4 max-w-6xl mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Form Column */}
          <div className="lg:col-span-7 xl:col-span-8">
            <ListPropertyForm cities={cities} localities={localities} />
          </div>

          {/* Value Props Column */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4 space-y-6 sticky top-28 h-fit">
            <div className="bg-[#0f172a] text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <Image 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Background"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[#0f172a] opacity-80 mix-blend-multiply" />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4 text-[#d4a853]">Why list with NivasaHQ?</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/10 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-[#d4a853]">✓</span>
                    </div>
                    <p className="text-slate-200 text-sm">Access to thousands of verified, high-intent buyers and tenants.</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/10 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-[#d4a853]">✓</span>
                    </div>
                    <p className="text-slate-200 text-sm">Premium visibility and marketing for your property listings.</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/10 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-[#d4a853]">✓</span>
                    </div>
                    <p className="text-slate-200 text-sm">Dedicated relationship manager to help close deals faster.</p>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
              <h4 className="font-semibold text-slate-800 mb-2">Need help listing?</h4>
              <p className="text-slate-500 text-sm mb-4">Our support team is available 24/7 to assist you.</p>
              <button className="text-[#0f172a] font-semibold text-sm border-b border-[#0f172a] pb-0.5 hover:text-[#d4a853] hover:border-[#d4a853] transition-colors">
                Contact Support
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
