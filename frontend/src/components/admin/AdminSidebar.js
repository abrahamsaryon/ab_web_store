"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  BarChart2, Settings, LogOut, Store,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => { logout(); router.push("/"); };

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <Link href="/admin" className="flex items-center gap-2 text-xl font-bold">
          <Store size={24} className="text-blue-400" /> AB Admin
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              pathname === href ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <Icon size={18} /> {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700 space-y-1">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition">
          <Store size={18} /> View Store
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
