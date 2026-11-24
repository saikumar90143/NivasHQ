import PropertyCard from '@/components/property/PropertyCard';

const latestData = [
  {
    id: '4',
    title: 'Spacious 3 BHK in Gachibowli',
    price: '₹1.15 Cr',
    type: 'Apartment',
    bhk: 3,
    area: '1800 sqft',
    location: 'Gachibowli, Hyderabad',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    verified: true
  },
  {
    id: '5',
    title: 'Luxury Mansion in Banjara Hills',
    price: '₹5.50 Cr',
    type: 'Villa',
    bhk: 5,
    area: '6000 sqft',
    location: 'Banjara Hills, Hyderabad',
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop',
    verified: true
  },
  {
    id: '6',
    title: 'Elegant 3 BHK in HITEC City',
    price: '₹1.80 Cr',
    type: 'Apartment',
    bhk: 3,
    area: '2400 sqft',
    location: 'HITEC City, Hyderabad',
    imageUrl: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop'
  },
  {
    id: '7',
    title: 'Cozy 2 BHK in Kondapur',
    price: '₹75 L',
    type: 'Apartment',
    bhk: 2,
    area: '1100 sqft',
    location: 'Kondapur, Hyderabad',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
    verified: true
  }
];

export default function LatestProperties() {
  return (
    <section>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#0f172a]">Latest Properties</h2>
          <p className="text-gray-500 mt-2">Recently added properties in Hyderabad</p>
        </div>
        <a href="/properties" className="text-[#d4a853] font-semibold hover:underline hidden md:block">View All</a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {latestData.map(prop => (
          <PropertyCard key={prop.id} {...prop} />
        ))}
      </div>
    </section>
  );
}
