"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";
import { ShoppingBag, Package, Clock, CheckCircle, User, Star, Lock, LayoutDashboard, ChevronRight, Menu, X } from "lucide-react";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "My Orders", icon: ShoppingBag },
  { id: "reviews", label: "My Reviews", icon: Star },
  { id: "profile", label: "Profile", icon: User },
  { id: "password", label: "Change Password", icon: Lock },
];

export default function DashboardPage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/auth"); return; }
    setProfileForm({ name: user.name || "", email: user.email || "" });
    Promise.all([
      api.get("/orders/my"),
      api.get(`/reviews/user`).catch(() => ({ data: [] })),
    ]).then(([o, r]) => {
      setOrders(o.data || []);
      setReviews(r.data || []);
    }).finally(() => setLoading(false));
  }, [user]);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    spent: orders.reduce((s, o) => s + Number(o.total_amount), 0),
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const r = await api.put("/profile", profileForm);
      setUser((prev) => ({ ...prev, name: profileForm.name, email: profileForm.email }));
      toast.success("Profile updated");
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSavingProfile(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) return toast.error("Passwords don't match");
    setSavingPw(true);
    try {
      await api.put("/profile/password", { current_password: pwForm.current_password, new_password: pwForm.new_password });
      toast.success("Password changed");
      setPwForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSavingPw(false); }
  };

  const navigate = (id) => { setTab(id); setSidebarOpen(false); };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Mobile header */}
      <div className="flex items-center justify-between mb-4 md:hidden">
        <h1 className="font-bold text-lg">My Account</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 border rounded-lg">
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "block" : "hidden"} md:block w-full md:w-56 shrink-0`}>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {/* User info */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <User size={24} />
              </div>
              <p className="font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-blue-200 text-xs truncate">{user?.email}</p>
            </div>
            <nav className="p-2">
              {NAV.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => navigate(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${tab === id ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                  <Icon size={16} /> {label}
                  {tab === id && <ChevronRight size={14} className="ml-auto" />}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* Overview */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Orders", value: stats.total, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
                  { label: "Delivered", value: stats.delivered, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
                  { label: "Total Spent", value: `${stats.spent.toLocaleString()} RWF`, icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
                    <div className={`${bg} p-2.5 rounded-xl`}><Icon size={20} className={color} /></div>
                    <div><p className="text-gray-500 text-xs">{label}</p><p className="font-bold text-sm">{value}</p></div>
                  </div>
                ))}
              </div>
              {/* Recent orders preview */}
              <div className="bg-white rounded-xl shadow p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold">Recent Orders</h2>
                  <button onClick={() => navigate("orders")} className="text-blue-600 text-sm hover:underline">View all →</button>
                </div>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag size={40} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm mb-3">No orders yet</p>
                    <Link href="/products" className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm hover:bg-blue-700 transition">Shop Now</Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orders.slice(0, 3).map((order) => (
                      <Link key={order.id} href={`/orders/${order.id}`}
                        className="flex items-center justify-between border rounded-lg p-3 hover:border-blue-300 transition text-sm">
                        <div>
                          <span className="font-medium">Order #{order.id}</span>
                          <p className="text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status]}`}>{order.status}</span>
                          <span className="font-bold text-blue-600">{Number(order.total_amount).toLocaleString()} RWF</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders */}
          {tab === "orders" && (
            <div className="bg-white rounded-xl shadow p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">My Orders</h2>
                <Link href="/products" className="text-blue-600 text-sm hover:underline">Continue Shopping →</Link>
              </div>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No orders yet</p>
                  <Link href="/products" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition">Shop Now</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <Link key={order.id} href={`/orders/${order.id}`}
                      className="block border rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">Order #{order.id}</span>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[order.status]}`}>{order.status}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-1">{order.products}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-1"><Clock size={12} />{new Date(order.created_at).toLocaleDateString()}</span>
                        <span className="font-bold text-blue-600">{Number(order.total_amount).toLocaleString()} RWF</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews */}
          {tab === "reviews" && (
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="font-semibold text-lg mb-4">My Reviews</h2>
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">You haven't reviewed any products yet</p>
                  <Link href="/products" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition">Browse Products</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <Link href={`/products/${r.product_id}`} className="font-medium text-blue-600 hover:underline text-sm">{r.product_name}</Link>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === "approved" ? "bg-green-100 text-green-700" : r.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{r.status}</span>
                      </div>
                      <div className="flex gap-0.5 mb-1">
                        {[1,2,3,4,5].map((s) => <Star key={s} size={13} className={s <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} />)}
                      </div>
                      {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                      <p className="text-xs text-gray-400 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile */}
          {tab === "profile" && (
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="font-semibold text-lg mb-4">Edit Profile</h2>
              <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <button type="submit" disabled={savingProfile}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-60">
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}

          {/* Password */}
          {tab === "password" && (
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="font-semibold text-lg mb-4">Change Password</h2>
              <form onSubmit={handlePasswordSave} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input type="password" value={pwForm.current_password} onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input type="password" value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input type="password" value={pwForm.confirm_password} onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <button type="submit" disabled={savingPw}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-60">
                  {savingPw ? "Saving..." : "Change Password"}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
