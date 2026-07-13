"use client";
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const isSuccess = searchParams.get("success") === "true";

  useEffect(() => {
    if (!user) { router.push("/auth"); return; }
    api.get(`/orders/${id}`).then((r) => setOrder(r.data));
  }, [id, user]);

  if (!order) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mb-8">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-green-700">Order Placed Successfully!</h2>
          <p className="text-green-600">Thank you for your purchase.</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[order.status]}`}>{order.status}</span>
        </div>

        <div className="space-y-3 mb-6">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm border-b pb-3">
              <span>{item.name} × {item.quantity}</span>
              <span className="font-medium">{(item.price * item.quantity).toLocaleString()} RWF</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between font-bold text-lg mb-6">
          <span>Total</span>
          <span className="text-blue-600">{Number(order.total_amount).toLocaleString()} RWF</span>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">Delivery to:</span> {order.shipping_address}</p>
          <p><span className="font-medium">Phone:</span> {order.phone}</p>
          <p><span className="font-medium">Payment:</span> {order.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : order.payment_method === 'whatsapp' ? 'WhatsApp Order' : order.payment_method}</p>
          <p><span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <Link href="/orders" className="flex-1 text-center border border-blue-600 text-blue-600 py-2.5 rounded-xl hover:bg-blue-50 transition">My Orders</Link>
        <Link href="/products" className="flex-1 text-center bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition">Continue Shopping</Link>
      </div>
    </div>
  );
}
