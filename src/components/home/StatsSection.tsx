export default function StatsSection() {
  return (
    <section className="bg-[#0f172a] text-white py-16 rounded-3xl my-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-700">
        <div>
          <p className="text-4xl md:text-5xl font-bold text-[#d4a853] mb-2">10K+</p>
          <p className="text-gray-400 font-medium">Premium Properties</p>
        </div>
        <div>
          <p className="text-4xl md:text-5xl font-bold text-[#d4a853] mb-2">500+</p>
          <p className="text-gray-400 font-medium">Verified Agents</p>
        </div>
        <div>
          <p className="text-4xl md:text-5xl font-bold text-[#d4a853] mb-2">15K+</p>
          <p className="text-gray-400 font-medium">Happy Customers</p>
        </div>
        <div>
          <p className="text-4xl md:text-5xl font-bold text-[#d4a853] mb-2">50+</p>
          <p className="text-gray-400 font-medium">Localities Covered</p>
        </div>
      </div>
    </section>
  );
}
