"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Check, X, Trash2, Star, Search } from "lucide-react";
import StarRating from "@/components/ui/StarRating";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminReviews() {
  const { user } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/auth"); return; }
    if (user.role !== "admin") { router.push("/"); return; }
    load();
  }, [user, filter]);

  const load = () => {
    setLoading(true);
    api.get(`/reviews${filter ? `?status=${filter}` : ""}`)
      .then((r) => setReviews(r.data || []))
      .finally(() => setLoading(false));
  };

  const handleStatus = async (id, status) => {
    await api.put(`/reviews/${id}/status`, { status });
    toast.success(`Review ${status}`);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this review permanently?")) return;
    await api.delete(`/reviews/${id}`);
    toast.success("Review deleted");
    load();
  };

  const filtered = reviews.filter((r) =>
    !search ||
    r.user_name.toLowerCase().includes(search.toLowerCase()) ||
    r.product_name.toLowerCase().includes(search.toLowerCase())
  );

  const counts = { all: reviews.length };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Review Moderation</h1>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
        <strong>How it works:</strong> Only customers who have a <strong>delivered order</strong> containing the product can submit a review.
        All reviews start as <strong>pending</strong> and must be approved by an admin before they appear publicly on the product page.
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {["pending", "approved", "rejected", ""].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === s ? "bg-blue-600 text-white" : "bg-white border hover:bg-gray-50"}`}>
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer or product..."
          className="w-full pl-9 pr-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && <p className="text-center text-gray-400 py-10">No reviews found</p>}
          {filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-semibold">{r.user_name}</span>
                    <span className="text-gray-400 text-sm">on</span>
                    <span className="text-blue-600 font-medium text-sm">{r.product_name}</span>
                    {r.verified_purchase === 1 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check size={10} /> Verified Purchase
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[r.status]}`}>{r.status}</span>
                  </div>
                  <StarRating rating={r.rating} size={14} />
                  {r.comment && <p className="text-gray-600 text-sm mt-2">{r.comment}</p>}
                  <p className="text-xs text-gray-400 mt-2">{new Date(r.created_at).toLocaleString()}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {r.status !== "approved" && (
                    <button onClick={() => handleStatus(r.id, "approved")}
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 transition">
                      <Check size={13} /> Approve
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button onClick={() => handleStatus(r.id, "rejected")}
                      className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-yellow-600 transition">
                      <X size={13} /> Reject
                    </button>
                  )}
                  <button onClick={() => handleDelete(r.id)}
                    className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-600 transition">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
