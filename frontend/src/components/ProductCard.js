"use client";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useState } from "react";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const router = useRouter();
  const [waLoading, setWaLoading] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleWhatsApp = async (e) => {
    e.preventDefault();
    if (!user) { router.push("/auth"); return; }
    setWaLoading(true);
    try {
      const res = await api.post("/orders/whatsapp", {
        product_id: product.id,
        quantity: 1,
        default_number: settings.contact_phone,
      });
      window.open(res.data.whatsapp_url, "_blank");
      toast.success(`Order #${res.data.order_id} recorded!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setWaLoading(false); }
  };

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden flex flex-col">
      <Link href={`/products/${product.id}`}>
        <div className="relative h-48 w-full bg-gray-100">
          <Image
            src={product.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"}
            alt={product.name}
            fill
            className="object-cover"
          />
          {!!product.whatsapp_enabled && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">WhatsApp</span>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-blue-600 font-medium mb-1">{product.category_name}</span>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-800 hover:text-blue-600 transition line-clamp-2">{product.name}</h3>
        </Link>
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-blue-600 shrink-0">
            {Number(product.price).toLocaleString()} RWF
          </span>
          <div className="flex items-center gap-1.5">
            {!!product.whatsapp_enabled && (
              <button
                onClick={handleWhatsApp}
                disabled={product.stock === 0 || waLoading}
                title="Buy via WhatsApp"
                className="flex items-center gap-1 bg-green-500 text-white px-2.5 py-1.5 rounded-lg text-sm hover:bg-green-600 transition disabled:opacity-50"
              >
                <MessageCircle size={14} /> {waLoading ? "..." : "Buy"}
              </button>
            )}
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              <ShoppingCart size={14} /> Add
            </button>
          </div>
        </div>
        {product.stock === 0 && <p className="text-red-500 text-xs mt-1">Out of stock</p>}
      </div>
    </div>
  );
}
