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

function RevenueChart({ daily }) {
  if (!daily?.length) return null;
  const W = 600, H = 120, PAD = 8;
  const values = daily.map((d) => d.revenue);
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => {
    const x = PAD + (i / (values.length - 1)) * (W - PAD * 2);
    const y = H - PAD - (v / max) * (H - PAD * 2);
    return `${x},${y}`;
  });
  const area = `M${pts[0]} L${pts.join(" L")} L${PAD + (W - PAD * 2)},${H - PAD} L${PAD},${H - PAD} Z`;
  const line = `M${pts[0]} L${pts.join(" L")}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28" preserveAspectRatio="none">
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#rg)" />
      <path d={line} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/auth"); return; }
    if (user.role !== "admin") { router.push("/"); return; }
    Promise.all([
      api.get("/orders/stats"),
      api.get("/orders"),
    ]).then(([s, o]) => {
      setStats(s.data);
      setRecentOrders((o.data || []).slice(0, 5));
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  const { products, orders, revenue, customers, statusCounts, daily } = stats;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Products", value: products, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Orders", value: orders, icon: ShoppingBag, color: "text-green-600", bg: "bg-green-50" },
          { label: "Total Revenue", value: `${Number(revenue).toLocaleString()} RWF`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Customers", value: customers, icon: Users, color: "text-orange-600", bg: "bg-orange-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
            <div className={`${bg} p-3 rounded-xl`}><Icon size={24} className={color} /></div>
            <div><p className="text-gray-500 text-sm">{label}</p><p className="text-2xl font-bold">{value}</p></div>
          </div>
        ))}
      </div>

      {/* Revenue Chart + Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Revenue — Last 30 Days</h2>
            <span className="text-sm text-gray-400">
              {daily?.length ? `${daily[0].date} → ${daily[daily.length - 1].date}` : ""}
            </span>
          </div>
          <RevenueChart daily={daily} />
          <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
            <span>{daily?.[0]?.date?.slice(5)}</span>
            <span>{daily?.[daily.length - 1]?.date?.slice(5)}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize text-gray-600">{status}</span>
                  <span className="font-semibold">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${statusColors[status]?.split(" ")[0].replace("bg-", "bg-").replace("-100", "-400")}`}
                    style={{ width: orders ? `${(count / orders) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
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
