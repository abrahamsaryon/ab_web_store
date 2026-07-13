"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Search } from "lucide-react";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrders() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!user) { router.push("/auth"); return; }
    if (user.role !== "admin") { router.push("/"); return; }
    api.get("/orders").then((r) => setOrders(r.data || []));
  }, [user]);

  const handleStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    toast.success("Status updated");
    api.get("/orders").then((r) => setOrders(r.data || []));
  };

  const filtered = orders.filter((o) => {
    const matchSearch = !search || String(o.id).includes(search) || (o.customer_name || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = !filter || o.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order ID or customer..."
            className="w-full pl-9 pr-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Statuses</option>
          {["pending","confirmed","shipped","delivered","cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {["pending","confirmed","shipped","delivered","cancelled"].map((s) => (
          <div key={s} className={`rounded-xl p-3 text-center ${statusColors[s]}`}>
            <p className="text-xs font-medium capitalize">{s}</p>
            <p className="text-xl font-bold">{orders.filter((o) => o.status === s).length}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="text-left px-4 py-3">Order ID</th>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Update Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">#{o.id}</td>
                <td className="px-4 py-3">{o.customer_name || "Guest"}<br /><span className="text-xs text-gray-400">{o.email}</span></td>
                <td className="px-4 py-3 font-semibold">{Number(o.total_amount).toLocaleString()} RWF</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[o.status]}`}>{o.status}</span></td>
                <td className="px-4 py-3 text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <select value={o.status} onChange={(e) => handleStatus(o.id, e.target.value)}
                    className="border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                    {["pending","confirmed","shipped","delivered","cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-400 py-10">No orders found</p>}
      </div>
    </div>
  );
}
