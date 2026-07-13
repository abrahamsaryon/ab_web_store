"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: "", address: "", payment_method: "cash_on_delivery" });
  const [loading, setLoading] = useState(false);

  if (cart.length === 0) { router.push("/cart"); return null; }
  if (!user) { router.push("/auth"); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone || !form.address) return toast.error("Please fill all fields");
    setLoading(true);
    try {
      const res = await api.post("/orders", {
        items: cart.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        shipping_address: form.address,
        phone: form.phone,
        payment_method: form.payment_method,
      });
      clearCart();
      router.push(`/orders/${res.data.order_id}?success=true`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Shipping Information</h2>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Full Name" className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email" className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Phone (e.g. +250 7XX XXX XXX)" className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Delivery Address" rows={3} className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Payment Method</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment" value="cash_on_delivery" checked={form.payment_method === "cash_on_delivery"}
                  onChange={() => setForm({ ...form, payment_method: "cash_on_delivery" })} />
                <div>
                  <p className="font-medium text-sm">Cash on Delivery</p>
                  <p className="text-xs text-gray-400">Pay when your order arrives</p>
                </div>
              </label>
              <label className="flex items-center gap-3 border rounded-lg px-4 py-3 opacity-50 cursor-not-allowed">
                <input type="radio" disabled />
                <div>
                  <p className="font-medium text-sm">Mobile Money <span className="text-xs text-blue-500 ml-1">Coming Soon</span></p>
                  <p className="text-xs text-gray-400">MTN / Airtel Money</p>
                </div>
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60">
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3 mb-6">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span className="font-medium">{(item.price * item.quantity).toLocaleString()} RWF</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-blue-600">{total.toLocaleString()} RWF</span>
          </div>
        </div>
      </div>
    </div>
  );
}
