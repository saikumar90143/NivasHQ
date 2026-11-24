import { Shield, Home, Clock, Award } from 'lucide-react';

export default function WhyChooseUs() {
  return (
    <section className="bg-white py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-[#0f172a]">Why Choose NivasaHQ</h2>
        <p className="text-gray-500 mt-2 max-w-2xl mx-auto">We redefine the real estate experience with trust and transparency.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center hover:shadow-md transition">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Verified Listings</h3>
          <p className="text-gray-500 text-sm">Every property is thoroughly verified for authenticity and legal compliance.</p>
        </div>
        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center hover:shadow-md transition">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
          <p className="text-gray-500 text-sm">We only list premium properties that meet our high quality standards.</p>
        </div>
        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center hover:shadow-md transition">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Save Time</h3>
          <p className="text-gray-500 text-sm">Advanced search and matching algorithms help you find the perfect home faster.</p>
        </div>
        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center hover:shadow-md transition">
          <div className="w-16 h-16 bg-yellow-100 text-[#d4a853] rounded-full flex items-center justify-center mx-auto mb-4">
            <Award size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Expert Guidance</h3>
          <p className="text-gray-500 text-sm">Our expert advisors assist you throughout the entire buying or renting process.</p>
        </div>
      </div>
    </section>
  );
}
