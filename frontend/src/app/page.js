"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { useSettings } from "@/context/SettingsContext";

export default function HomePage() {
  const { settings } = useSettings();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products?limit=8").then((r) => setProducts(r.data.products || [])).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section
        className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-14 sm:py-20 px-4"
        style={settings.hero_banner ? { backgroundImage: `url(${settings.hero_banner})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
      >
        {settings.hero_banner && <div className="absolute inset-0 bg-blue-900/60" />}
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">{settings.hero_title}</h1>
          <p className="text-base sm:text-xl text-blue-100 mb-8">{settings.hero_subtitle}</p>
          <Link href="/products" className="bg-white text-blue-600 px-6 sm:px-8 py-3 rounded-full font-semibold text-base sm:text-lg hover:bg-blue-50 transition">
            Shop Now
          </Link>
        </div>
      </section>

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
