"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Trash2, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();

  if (cart.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <ShoppingBag size={64} className="text-gray-300" />
        <p className="text-xl text-gray-500">Your cart is empty</p>
        <Link href="/products" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition">
          Start Shopping
        </Link>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="space-y-4 mb-8">
        {cart.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <Image src={item.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"} alt={item.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-blue-600 font-bold">{Number(item.price).toLocaleString()} RWF</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 border rounded-lg flex items-center justify-center hover:bg-gray-50">−</button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 border rounded-lg flex items-center justify-center hover:bg-gray-50">+</button>
            </div>
            <p className="w-28 text-right font-semibold">{(item.price * item.quantity).toLocaleString()} RWF</p>
            <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 transition">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
        <div>
          <p className="text-gray-500">Total</p>
          <p className="text-2xl font-bold text-blue-600">{total.toLocaleString()} RWF</p>
        </div>
        <Link href="/checkout" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
