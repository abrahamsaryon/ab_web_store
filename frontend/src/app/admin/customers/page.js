"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Search, Plus, Edit2, Trash2, X, Check, User, Eye, Ban, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import PasswordInput, { isStrongPassword } from "@/components/ui/PasswordInput";
import ImageUploader from "@/components/ui/ImageUploader";

const empty = { name: "", email: "", password: "", role: "customer", avatar: "" };
const statusColors = { pending: "bg-yellow-100 text-yellow-700", confirmed: "bg-blue-100 text-blue-700", shipped: "bg-purple-100 text-purple-700", delivered: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700" };

export default function AdminCustomers() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  useEffect(() => {
    if (!user) { router.push("/auth"); return; }
    if (user.role !== "admin") { router.push("/"); return; }
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    api.get("/users").then((r) => setUsers(r.data || [])).finally(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && !isStrongPassword(form.password))
      return toast.error("Password is not strong enough");
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email, role: form.role, avatar: form.avatar };
      if (form.password) payload.password = form.password;
      editId ? await api.put(`/users/${editId}`, payload) : await api.post("/users", { ...payload, password: form.password });
      toast.success(editId ? "User updated" : "User created");
      setShowForm(false); setForm(empty); setEditId(null); load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setSaving(false); }
  };

  const handleEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: "", role: u.role, avatar: u.avatar || "" });
    setEditId(u.id); setShowForm(true); setViewUser(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted"); load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleView = async (id) => {
    const res = await api.get(`/users/${id}`);
    setViewUser(res.data);
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.patch(`/users/${id}/status`);
      toast.success(res.data.message);
      load();
      if (viewUser?.id === id) setViewUser((prev) => ({ ...prev, status: res.data.status }));
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  // Reset page on search
  useEffect(() => { setPage(1); }, [search]);

  const filtered = users.filter((u) =>
    u.role === "customer" &&
    (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(empty); setViewUser(null); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
          className="w-full pl-9 pr-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">{editId ? "Edit Customer" : "Add New Customer"}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4" autoComplete="off">
            {/* Avatar */}
            <div className="md:col-span-2 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {form.avatar ? <img src={form.avatar} alt="avatar" className="w-full h-full object-cover" /> : <User size={28} className="text-blue-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">Profile Picture</p>
                <ImageUploader value={form.avatar} onChange={(url) => setForm({ ...form, avatar: url })}
                  folder="ab_webstore/avatars" label="Avatar" previewClass="hidden" />
              </div>
            </div>

            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full Name" autoComplete="off"
              className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email Address" autoComplete="off"
              className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {editId ? "New Password (leave blank to keep current)" : "Password *"}
              </label>
              <PasswordInput value={form.password} onChange={(v) => setForm({ ...form, password: v })}
                placeholder="Password" required={!editId} showStrength={true} />
            </div>

            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="customer">Customer</option>
            </select>

            <div className="flex gap-3 md:col-span-2">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-60">
                <Check size={16} /> {saving ? "Saving..." : editId ? "Update Customer" : "Create Customer"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                className="flex items-center gap-2 border px-6 py-2.5 rounded-lg hover:bg-gray-50 transition">
                <X size={16} /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View User Modal */}
      {viewUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Customer Profile</h2>
              <button onClick={() => setViewUser(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                {viewUser.avatar ? <img src={viewUser.avatar} alt="avatar" className="w-full h-full object-cover" /> : <User size={28} className="text-blue-600" />}
              </div>
              <div>
                <p className="text-xl font-bold">{viewUser.name}</p>
                <p className="text-gray-500 text-sm">{viewUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{viewUser.role}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${viewUser.status === 'suspended' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                    {viewUser.status || 'active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-blue-600">{viewUser.orders?.length || 0}</p>
                <p className="text-xs text-gray-500">Orders</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-green-600">
                  {(viewUser.orders || []).filter(o => o.status === 'delivered').length}
                </p>
                <p className="text-xs text-gray-500">Delivered</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-sm font-bold text-purple-600">
                  {(viewUser.orders || []).reduce((s, o) => s + Number(o.total_amount), 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">RWF Spent</p>
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-4">Joined: {new Date(viewUser.created_at).toLocaleDateString()}</p>

            {viewUser.orders?.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold mb-2 text-sm">Order History</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {viewUser.orders.map((o) => (
                    <div key={o.id} className="flex justify-between items-center text-sm border rounded-lg px-3 py-2">
                      <div>
                        <span className="font-medium">#{o.id}</span>
                        <span className="text-gray-400 text-xs ml-2">{new Date(o.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[o.status] || ''}`}>{o.status}</span>
                        <span className="font-medium">{Number(o.total_amount).toLocaleString()} RWF</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => handleEdit(viewUser)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition text-sm">
                <Edit2 size={14} /> Edit Profile
              </button>
              <button onClick={() => handleToggleStatus(viewUser.id)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition text-sm border ${viewUser.status === 'suspended' ? 'text-green-600 hover:bg-green-50' : 'text-orange-500 hover:bg-orange-50'}`}>
                {viewUser.status === 'suspended' ? <><CheckCircle size={14} /> Activate</> : <><Ban size={14} /> Suspend</>}
              </button>
              <button onClick={() => { setViewUser(null); handleDelete(viewUser.id); }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 text-red-500 hover:bg-red-50 transition text-sm">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Email</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Joined</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginated.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : <User size={14} className="text-blue-600" />}
                    </div>
                    <span className="font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{u.email}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.status === 'suspended' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                    {u.status || 'active'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => handleView(u.id)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition" title="View"><Eye size={15} /></button>
                    <button onClick={() => handleEdit(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit"><Edit2 size={15} /></button>
                    <button onClick={() => handleToggleStatus(u.id)} title={u.status === 'suspended' ? 'Activate' : 'Suspend'}
                      className={`p-1.5 rounded-lg transition ${u.status === 'suspended' ? 'text-green-600 hover:bg-green-50' : 'text-orange-500 hover:bg-orange-50'}`}>
                      {u.status === 'suspended' ? <CheckCircle size={15} /> : <Ban size={15} />}
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && <p className="text-center text-gray-400 py-10">No customers found</p>}
        {loading && <p className="text-center text-gray-400 py-10">Loading...</p>}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border hover:bg-gray-100 disabled:opacity-40"><ChevronLeft size={16} /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? <span key={`e${i}`} className="px-2 text-gray-400">…</span> :
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm ${page === p ? "bg-blue-600 text-white" : "border hover:bg-gray-100"}`}>{p}</button>
                )}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border hover:bg-gray-100 disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
