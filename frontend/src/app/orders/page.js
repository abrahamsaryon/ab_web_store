"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/auth"); return; }
    api.get("/orders/my").then((r) => setOrders(r.data)).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No orders yet</p>
          <Link href="/products" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="block bg-white rounded-xl shadow p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Order #{order.id}</span>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[order.status]}`}>{order.status}</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">{order.products}</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                <span className="font-bold text-blue-600">{Number(order.total_amount).toLocaleString()} RWF</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
