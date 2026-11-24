'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';

export default function SearchBar() {
  const [tab, setTab] = useState('Buy');
  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl max-w-4xl mx-auto border border-gray-100">
      <div className="flex gap-4 border-b border-gray-200 mb-4 pb-2">
        {['Buy', 'Rent', 'Plot', 'Villa', 'Commercial'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 font-medium transition-colors ${tab === t ? 'text-[#d4a853] border-b-2 border-[#d4a853]' : 'text-gray-500 hover:text-gray-900'}`}>{t}</button>
        ))}
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <input type="text" placeholder="Search locality or landmark in Hyderabad..." className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#d4a853] w-full" />
        <select className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#d4a853] w-full md:w-auto">
          <option>Budget</option>
          <option>Up to 50 L</option>
          <option>50 L - 1 Cr</option>
          <option>1 Cr - 3 Cr</option>
          <option>3 Cr+</option>
        </select>
        <button className="bg-[#d4a853] text-[#0f172a] px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#d4a853]/90 transition w-full md:w-auto justify-center">
          <Search size={18} /> Search
        </button>
      </div>
    </motion.div>
  );
}
