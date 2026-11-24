import React from 'react';
import PropertyForm from '@/components/property/PropertyForm';
import { db } from '@/lib/db';
import { Metadata } from 'next';
import { Building2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Add New Property | NivasaHQ',
  description: 'Add a new property to the NivasaHQ marketplace',
};

export default async function NewPropertyPage() {
  // Fetch localities for the property location dropdown
  const locations = await db.location.findMany({
    select: { id: true, name: true, level: true },
    where: { level: 'LOCALITY' },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center space-x-4 mb-10 pl-2">
          <div className="p-3 bg-slate-900 rounded-xl text-amber-500 shadow-lg shadow-slate-900/20">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Create New Listing</h1>
            <p className="text-slate-500 mt-1.5 text-lg">Add a new property to your portfolio and reach thousands of buyers.</p>
          </div>
        </div>

        <PropertyForm locations={locations} />
      </div>
    </div>
  );
}
