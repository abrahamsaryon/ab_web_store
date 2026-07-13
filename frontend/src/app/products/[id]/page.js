"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { ShoppingCart, ArrowLeft } from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((r) => setProduct(r.data))
      .catch(() => router.push("/products"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!product) return null;

  const handleAdd = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="bg-white rounded-2xl shadow p-6 md:p-10 grid md:grid-cols-2 gap-10">
        <div className="relative h-80 rounded-xl overflow-hidden bg-gray-100">
          <Image
            src={product.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-sm text-blue-600 font-medium mb-2">{product.category_name}</span>
          <h1 className="text-2xl font-bold mb-3">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <p className="text-3xl font-bold text-blue-600 mb-2">{Number(product.price).toLocaleString()} RWF</p>
          <p className="text-sm text-gray-500 mb-6">
            {product.stock > 0 ? <span className="text-green-600">{product.stock} in stock</span> : <span className="text-red-500">Out of stock</span>}
          </p>

          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-50">−</button>
            <span className="w-10 text-center font-semibold">{quantity}</span>
            <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-50">+</button>
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            <ShoppingCart size={20} /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
