import { Metadata } from "next";
import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Calendar, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Real Estate Guides & Articles | NivasaHQ",
  description: "Expert insights, buying guides, and real estate market trends.",
};

export default async function GuidesPage() {
  let articles: any[] = [];
  
  try {
    articles = await db.article.findMany({
      where: {
        status: 'PUBLISHED'
      },
      include: {
        author: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 20
    });
  } catch (error) {
    console.warn("Database connection failed", error);
  }

  // Format date helper
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Guides Hero Header */}
        <div className="bg-sky-900 rounded-3xl p-8 md:p-12 mb-12 text-white flex flex-col justify-center items-center text-center shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="grid-pattern-guides" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 0 10 L 20 10 M 10 0 L 10 20" stroke="white" strokeWidth="0.5" fill="none" />
              </pattern>
              <rect width="100" height="100" fill="url(#grid-pattern-guides)" />
            </svg>
          </div>
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Real Estate Guides & Insights</h1>
            <p className="text-sky-100 text-lg">
              Read our latest articles, market trends, and comprehensive buying guides to navigate the real estate landscape like a pro.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Latest Articles</h2>
            <div className="hidden md:flex gap-2">
              <span className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded-full text-sm font-medium cursor-pointer hover:bg-slate-300">All</span>
              <span className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full text-sm font-medium cursor-pointer hover:bg-slate-50">Buying</span>
              <span className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full text-sm font-medium cursor-pointer hover:bg-slate-50">Investing</span>
              <span className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full text-sm font-medium cursor-pointer hover:bg-slate-50">Market Trends</span>
            </div>
          </div>
          
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <Link href={`/guides/${article.slug}`} key={article.id} className="group block h-full">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 h-full flex flex-col">
                    <div className="relative h-56 w-full overflow-hidden">
                      <Image
                        src={article.featuredImageUrl || "https://images.unsplash.com/photo-1585909695026-6d60c41b802a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {article.category && (
                        <span className="absolute top-4 left-4 bg-white/90 text-slate-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          {article.category}
                        </span>
                      )}
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-sky-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-grow">
                        {article.excerpt || article.content.substring(0, 150) + "..."}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 font-medium">
                          <User size={14} className="text-slate-400" />
                          {article.author?.name || "NivasaHQ Expert"}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-400" />
                          {article.publishedAt ? formatDate(article.publishedAt) : "Recently"}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed p-12 text-center max-w-2xl mx-auto mt-8">
              <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No articles found</h3>
              <p className="text-slate-500">We're currently writing some great content. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
