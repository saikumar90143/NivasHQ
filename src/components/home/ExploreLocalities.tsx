const localities = [
  { name: 'Kokapet', count: 120, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop' },
  { name: 'Gachibowli', count: 85, image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop' },
  { name: 'Jubilee Hills', count: 45, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop' },
  { name: 'Banjara Hills', count: 32, image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop' },
  { name: 'HITEC City', count: 96, image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop' },
  { name: 'Kondapur', count: 110, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop' },
];

export default function ExploreLocalities() {
  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-[#0f172a]">Explore Hyderabad</h2>
        <p className="text-gray-500 mt-2 max-w-2xl mx-auto">Discover properties in top neighborhoods across the city.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {localities.map((loc, i) => (
          <div key={i} className="group relative rounded-xl overflow-hidden aspect-[4/5] cursor-pointer">
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition duration-300 z-10" />
            <img src={loc.image} alt={loc.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-500" />
            <div className="absolute bottom-0 left-0 p-4 z-20">
              <h3 className="text-white font-bold text-lg">{loc.name}</h3>
              <p className="text-gray-200 text-sm">{loc.count} Properties</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
