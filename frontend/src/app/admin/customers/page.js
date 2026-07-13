"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Search, User } from "lucide-react";

export default function AdminCustomers() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) { router.push("/auth"); return; }
    if (user.role !== "admin") { router.push("/"); return; }
    api.get("/orders").then((r) => setOrders(r.data || []));
  }, [user]);

  // Build customer list from orders
  const customerMap = {};
  orders.forEach((o) => {
    if (!o.user_id) return;
    if (!customerMap[o.user_id]) {
      customerMap[o.user_id] = { id: o.user_id, name: o.customer_name || "Unknown", email: o.email || "-", orders: 0, spent: 0 };
    }
    customerMap[o.user_id].orders += 1;
    customerMap[o.user_id].spent += Number(o.total_amount);
  });

  const customers = Object.values(customerMap).filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customers</h1>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..."
          className="w-full pl-9 pr-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Total Orders</th>
              <th className="text-left px-4 py-3">Total Spent</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={14} className="text-blue-600" />
                    </div>
                    <span className="font-medium">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{c.email}</td>
                <td className="px-4 py-3">{c.orders}</td>
                <td className="px-4 py-3 font-semibold text-blue-600">{c.spent.toLocaleString()} RWF</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <p className="text-center text-gray-400 py-10">No customers yet</p>}
      </div>
    </div>
  );
}
