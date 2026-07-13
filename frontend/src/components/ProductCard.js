"use client";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
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
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-blue-600 font-medium mb-1">{product.category_name}</span>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-800 hover:text-blue-600 transition line-clamp-2">{product.name}</h3>
        </Link>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-blue-600">
            {Number(product.price).toLocaleString()} RWF
          </span>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50"
          >
            <ShoppingCart size={15} /> Add
          </button>
        </div>
        {product.stock === 0 && <p className="text-red-500 text-xs mt-1">Out of stock</p>}
      </div>
    </div>
  );
}
