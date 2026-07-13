"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { ShoppingBag, Package, Clock, CheckCircle, User, MapPin, Phone } from "lucide-react";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/auth"); return; }
    api.get("/orders/my").then((r) => setOrders(r.data || [])).finally(() => setLoading(false));
  }, [user]);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    spent: orders.reduce((s, o) => s + Number(o.total_amount), 0),
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white mb-8 flex items-center gap-4">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
          <User size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
          <p className="text-blue-100">{user?.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Orders", value: stats.total, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Delivered", value: stats.delivered, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Total Spent", value: `${stats.spent.toLocaleString()} RWF`, icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
            <div className={`${bg} p-2.5 rounded-xl`}><Icon size={20} className={color} /></div>
            <div><p className="text-gray-500 text-xs">{label}</p><p className="font-bold text-sm">{value}</p></div>
          </div>
        ))}
      </div>

      {/* Orders */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">My Orders</h2>
          <Link href="/products" className="text-blue-600 text-sm hover:underline">Continue Shopping →</Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No orders yet</p>
            <Link href="/products" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition">Shop Now</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}
                className="block border rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Order #{order.id}</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[order.status]}`}>{order.status}</span>
                </div>
                <p className="text-sm text-gray-500 mb-2 line-clamp-1">{order.products}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1"><Clock size={12} />{new Date(order.created_at).toLocaleDateString()}</span>
                  <span className="font-bold text-blue-600">{Number(order.total_amount).toLocaleString()} RWF</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
