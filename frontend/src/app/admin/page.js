"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Package, ShoppingBag, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, customers: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/auth"); return; }
    if (user.role !== "admin") { router.push("/"); return; }
    Promise.all([
      api.get("/products?limit=1"),
      api.get("/orders"),
    ]).then(([p, o]) => {
      const orders = o.data || [];
      const revenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);
      const customers = new Set(orders.map((o) => o.user_id)).size;
      setStats({ products: p.data.total || 0, orders: orders.length, revenue, customers });
      setRecentOrders(orders.slice(0, 5));
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Products", value: stats.products, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Orders", value: stats.orders, icon: ShoppingBag, color: "text-green-600", bg: "bg-green-50" },
          { label: "Total Revenue", value: `${stats.revenue.toLocaleString()} RWF`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Customers", value: stats.customers, icon: Users, color: "text-orange-600", bg: "bg-orange-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
            <div className={`${bg} p-3 rounded-xl`}><Icon size={24} className={color} /></div>
            <div><p className="text-gray-500 text-sm">{label}</p><p className="text-2xl font-bold">{value}</p></div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-blue-600 text-sm hover:underline">View all</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="text-left pb-3">Order</th>
              <th className="text-left pb-3">Customer</th>
              <th className="text-left pb-3">Amount</th>
              <th className="text-left pb-3">Status</th>
              <th className="text-left pb-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {recentOrders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="py-3">#{o.id}</td>
                <td className="py-3">{o.customer_name || "Guest"}</td>
                <td className="py-3 font-medium">{Number(o.total_amount).toLocaleString()} RWF</td>
                <td className="py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[o.status]}`}>{o.status}</span></td>
                <td className="py-3 text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {recentOrders.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400">No orders yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
