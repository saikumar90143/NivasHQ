import PropertyCard from '@/components/property/PropertyCard';

const featuredData = [
  {
    id: '1',
    title: 'Luxury 3 BHK in Aparna Sarovar',
    price: '₹1.35 Cr',
    type: 'Apartment',
    bhk: 3,
    area: '2100 sqft',
    location: 'Kokapet, Hyderabad',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
    verified: true,
    featured: true
  },
  {
    id: '2',
    title: 'Premium Villa in Jubilee Hills',
    price: '₹3.50 Cr',
    type: 'Villa',
    bhk: 4,
    area: '4500 sqft',
    location: 'Jubilee Hills, Hyderabad',
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
    verified: true
  },
  {
    id: '3',
    title: 'Modern 2 BHK near Financial District',
    price: '₹85 L',
    type: 'Apartment',
    bhk: 2,
    area: '1250 sqft',
    location: 'Financial District, Hyderabad',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
    featured: true
  }
];

export default function FeaturedProperties() {
  return (
    <section>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#0f172a]">Featured Properties</h2>
          <p className="text-gray-500 mt-2">Handpicked premium properties for you</p>
        </div>
        <a href="/properties?featured=true" className="text-[#d4a853] font-semibold hover:underline hidden md:block">View All</a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredData.map(prop => (
          <PropertyCard key={prop.id} {...prop} />
        ))}
      </div>
    </section>
  );
}
