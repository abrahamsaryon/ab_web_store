"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { ShoppingCart, ArrowLeft, Star, User, Trash2 } from "lucide-react";
import StarRating from "@/components/ui/StarRating";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [canReviewData, setCanReview] = useState(null);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const [p, r] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/reviews/product/${id}`),
      ]);
      setProduct(p.data);
      setReviews(r.data.reviews || []);
      setAvgRating(r.data.avg_rating);
      // Load related products by same category
      const rel = await api.get(`/products?category=${p.data.category_id}&limit=4`);
      setRelated((rel.data.products || []).filter((rp) => rp.id !== Number(id)));
      // Check if user can review
      if (user) {
        api.get(`/reviews/can-review/${id}`).then((cr) => setCanReview(cr.data)).catch(() => {});
      }
    } catch {
      router.push("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Please login to leave a review");
    setSubmitting(true);
    try {
      await api.post(`/reviews/product/${id}`, reviewForm);
      toast.success("Review submitted!");
      setReviewForm({ rating: 5, comment: "" });
      const r = await api.get(`/reviews/product/${id}`);
      setReviews(r.data.reviews || []);
      setAvgRating(r.data.avg_rating);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    await api.delete(`/reviews/${reviewId}`);
    const r = await api.get(`/reviews/product/${id}`);
    setReviews(r.data.reviews || []);
    setAvgRating(r.data.avg_rating);
    toast.success("Review deleted");
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!product) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition">
        <ArrowLeft size={18} /> Back
      </button>

      {/* Product Info */}
      <div className="bg-white rounded-2xl shadow p-6 md:p-10 grid md:grid-cols-2 gap-10 mb-10">
        <div className="relative h-80 rounded-xl overflow-hidden bg-gray-100">
          <Image
            src={product.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"}
            alt={product.name} fill className="object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-blue-600 font-medium mb-2">{product.category_name}</span>
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          {avgRating && (
            <div className="flex items-center gap-2 mb-3">
              <StarRating rating={avgRating} size={16} />
              <span className="text-sm text-gray-500">{avgRating} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
            </div>
          )}
          <p className="text-gray-600 mb-6">{product.description}</p>
          <p className="text-3xl font-bold text-blue-600 mb-2">{Number(product.price).toLocaleString()} RWF</p>
          <p className="text-sm mb-6">
            {product.stock > 0 ? <span className="text-green-600">{product.stock} in stock</span> : <span className="text-red-500">Out of stock</span>}
          </p>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-50">−</button>
            <span className="w-10 text-center font-semibold">{quantity}</span>
            <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-50">+</button>
          </div>
          <button onClick={handleAdd} disabled={product.stock === 0}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            <ShoppingCart size={20} /> Add to Cart
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-10">
        {/* Write Review */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">Write a Review</h2>
          {user ? (
            canReviewData === null ? (
              <p className="text-gray-400 text-sm text-center py-4">Checking eligibility...</p>
            ) : !canReviewData.can_review ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm mb-1">Only verified buyers can review.</p>
                <p className="text-xs text-gray-400">Purchase this product and receive your order to leave a review.</p>
              </div>
            ) : canReviewData.already_reviewed && canReviewData.review_status === 'pending' ? (
              <div className="text-center py-6">
                <p className="text-yellow-600 text-sm font-medium">✓ Review submitted</p>
                <p className="text-xs text-gray-400 mt-1">Your review is pending admin approval.</p>
              </div>
            ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                <StarRating rating={reviewForm.rating} size={24} interactive onChange={(r) => setReviewForm({ ...reviewForm, rating: r })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience..." rows={4}
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-60">
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
            )
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-3">Login to leave a review</p>
              <Link href="/auth" className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition text-sm">Login</Link>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Customer Reviews</h2>
            {avgRating && (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-yellow-500">{avgRating}</span>
                <div>
                  <StarRating rating={avgRating} size={14} />
                  <p className="text-xs text-gray-400">{reviews.length} reviews</p>
                </div>
              </div>
            )}
          </div>
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {reviews.map((r) => (
                <div key={r.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {r.user_avatar ? <img src={r.user_avatar} alt={r.user_name} className="w-full h-full object-cover" /> : <User size={16} className="text-blue-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{r.user_name}</p>
                        <StarRating rating={r.rating} size={12} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                      {(user?.id === r.user_id || user?.role === "admin") && (
                        <button onClick={() => handleDeleteReview(r.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600 mt-2 ml-12">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
