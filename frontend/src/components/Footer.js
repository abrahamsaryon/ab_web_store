"use client";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { Store, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  const { settings } = useSettings();
  const { user } = useAuth();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 text-white text-xl font-bold mb-3">
            {settings.site_logo ? (
              <img src={settings.site_logo} alt="logo" className="h-8 w-8 object-contain rounded" />
            ) : (
              <Store size={24} className="text-blue-400" />
            )}
            {settings.site_name}
          </div>
          <p className="text-sm text-gray-400">{settings.site_tagline}</p>
          <div className="flex gap-3 mt-4">
            {settings.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition"><Facebook size={18} /></a>}
            {settings.twitter_url && <a href={settings.twitter_url} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition"><Twitter size={18} /></a>}
            {settings.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="hover:text-pink-400 transition"><Instagram size={18} /></a>}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white transition">Home</Link></li>
            <li><Link href="/products" className="hover:text-white transition">Products</Link></li>
            <li><Link href="/cart" className="hover:text-white transition">Cart</Link></li>
            <li><Link href="/orders" className="hover:text-white transition">My Orders</Link></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h3 className="text-white font-semibold mb-4">Customer Service</h3>
          <ul className="space-y-2 text-sm">
            {!user && <li><Link href="/auth" className="hover:text-white transition">Login / Register</Link></li>}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact Us</h3>
          <ul className="space-y-3 text-sm">
            {settings.contact_email && (
              <li className="flex items-center gap-2"><Mail size={15} className="text-blue-400" />{settings.contact_email}</li>
            )}
            {settings.contact_phone && (
              <li className="flex items-center gap-2"><Phone size={15} className="text-blue-400" />{settings.contact_phone}</li>
            )}
            {settings.contact_address && (
              <li className="flex items-center gap-2"><MapPin size={15} className="text-blue-400" />{settings.contact_address}</li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} {settings.site_name}. All rights reserved.
      </div>
    </footer>
  );
}
