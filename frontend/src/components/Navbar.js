"use client";
import Link from "next/link";
import { ShoppingCart, User, LogOut, Store, LayoutDashboard } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import { useSettings } from "@/context/SettingsContext";

export default function Navbar() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const router = useRouter();

  const handleLogout = () => { logout(); router.push("/"); };

  return (
    <nav className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          {settings.site_logo ? (
            <img src={settings.site_logo} alt="logo" className="h-8 w-8 object-contain rounded" />
          ) : (
            <Store size={22} />
          )}
          <span className="hidden xs:inline sm:inline">{settings.site_name}</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link href="/products" className="hover:text-blue-200 transition text-sm sm:text-base">Products</Link>

          <Link href="/cart" className="relative hover:text-blue-200 transition">
            <ShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {user.role === "admin" ? (
                <Link href="/admin" className="flex items-center gap-1 hover:text-blue-200 transition text-sm">
                  <LayoutDashboard size={17} /> <span className="hidden sm:inline">Admin</span>
                </Link>
              ) : (
                <Link href="/dashboard" className="flex items-center gap-1 hover:text-blue-200 transition text-sm">
                  <User size={17} /> <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                </Link>
              )}
              <button onClick={handleLogout} className="hover:text-blue-200 transition">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link href="/auth" className="bg-white text-blue-600 px-3 py-1.5 rounded-full font-medium text-sm hover:bg-blue-50 transition whitespace-nowrap">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
