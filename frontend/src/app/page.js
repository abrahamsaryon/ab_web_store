"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { useSettings } from "@/context/SettingsContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HomePage() {
  const { settings } = useSettings();
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api.get("/products?limit=8").then((r) => setProducts(r.data.products || [])).catch(() => {});
    api.get("/banners?active=1").then((r) => setBanners(r.data || [])).catch(() => {});
  }, []);

  const prev = useCallback(() => setCurrent((c) => (c - 1 + banners.length) % banners.length), [banners.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % banners.length), [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [banners.length, next]);

  const activeBanner = banners[current];

  return (
    <div>
      {/* Hero / Banner Carousel */}
      {banners.length > 0 ? (
        <section className="relative overflow-hidden">
          <div className="relative min-h-[200px] sm:min-h-[300px] md:min-h-[400px] bg-gradient-to-r from-blue-600 to-blue-800 text-white flex items-center">
            {activeBanner.image_url && (
              <img src={activeBanner.image_url} alt={activeBanner.title || ""}
                className="absolute inset-0 w-full h-full object-cover object-center" />
            )}
            {activeBanner.image_url && <div className="absolute inset-0 bg-blue-900/60" />}
            <div className="relative w-full max-w-4xl mx-auto text-center px-4 py-10 sm:py-16">
              {activeBanner.title && <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3">{activeBanner.title}</h1>}
              {activeBanner.subtitle && <p className="text-sm sm:text-xl text-blue-100 mb-6">{activeBanner.subtitle}</p>}
              {activeBanner.button_text && (
                <Link href={activeBanner.button_link || "/products"}
                  className="bg-white text-blue-600 px-6 sm:px-8 py-3 rounded-full font-semibold text-base sm:text-lg hover:bg-blue-50 transition inline-block">
                  {activeBanner.button_text}
                </Link>
              )}
            </div>
          </div>
          {banners.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition">
                <ChevronLeft size={20} />
              </button>
              <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition">
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {banners.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)}
                    className={`w-2 h-2 rounded-full transition ${i === current ? "bg-white" : "bg-white/40"}`} />
                ))}
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden min-h-[200px] sm:min-h-[300px] md:min-h-[400px] flex items-center">
          {settings.hero_banner && (
            <img src={settings.hero_banner} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          {settings.hero_banner && <div className="absolute inset-0 bg-blue-900/60" />}
          <div className="relative w-full max-w-4xl mx-auto text-center px-4 py-10 sm:py-16">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3">{settings.hero_title}</h1>
            <p className="text-sm sm:text-xl text-blue-100 mb-6">{settings.hero_subtitle}</p>
            <Link href="/products" className="bg-white text-blue-600 px-6 sm:px-8 py-3 rounded-full font-semibold text-base sm:text-lg hover:bg-blue-50 transition inline-block">
              Shop Now
            </Link>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {["Electronics", "Clothing", "Books", "Home & Garden"].map((cat) => (
            <Link key={cat} href={`/products?category=${encodeURIComponent(cat)}`}
              className="bg-white rounded-xl p-4 sm:p-6 text-center shadow hover:shadow-md hover:text-blue-600 transition font-medium text-sm sm:text-base">
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 pb-12 sm:pb-16">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Featured Products</h2>
          <Link href="/products" className="text-blue-600 hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
