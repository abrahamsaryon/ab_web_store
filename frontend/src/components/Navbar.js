"use client";
import Link from "next/link";
import { ShoppingCart, User, LogOut, Store, LayoutDashboard } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => { logout(); router.push("/"); };

  return (
    <nav className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Store size={24} /> AB WebStore
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/products" className="hover:text-blue-200 transition">Products</Link>

          <Link href="/cart" className="relative hover:text-blue-200 transition">
            <ShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              {user.role === "admin" ? (
                <Link href="/admin" className="flex items-center gap-1 hover:text-blue-200 transition">
                  <LayoutDashboard size={18} /> Admin
                </Link>
              ) : (
                <Link href="/dashboard" className="flex items-center gap-1 hover:text-blue-200 transition">
                  <User size={18} /> {user.name.split(" ")[0]}
                </Link>
              )}
              <Link href="/profile" className="hover:text-blue-200 transition text-sm" title="My Profile">
                <User size={16} />
              </Link>
              <button onClick={handleLogout} className="hover:text-blue-200 transition">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link href="/auth" className="bg-white text-blue-600 px-4 py-1.5 rounded-full font-medium hover:bg-blue-50 transition">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
