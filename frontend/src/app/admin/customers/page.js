"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Search, Plus, Edit2, Trash2, X, Check, User, Eye } from "lucide-react";

const empty = { name: "", email: "", password: "", role: "customer" };

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
    try {
      if (editId) {
        const payload = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        await api.put(`/users/${editId}`, payload);
        toast.success("User updated");
      } else {
        await api.post("/users", form);
        toast.success("User created");
      }
      setShowForm(false); setForm(empty); setEditId(null); load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setEditId(u.id); setShowForm(true); setViewUser(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted"); load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleView = async (id) => {
    const res = await api.get(`/users/${id}`);
    setViewUser(res.data);
  };

  const filtered = users.filter((u) =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors = { admin: "bg-purple-100 text-purple-700", customer: "bg-green-100 text-green-700" };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers & Users</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(empty); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
          className="w-full pl-9 pr-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <h2 className="md:col-span-2 font-semibold text-lg">{editId ? "Edit User" : "Add New User"}</h2>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Full Name" className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email Address" className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder={editId ? "New Password (leave blank to keep)" : "Password *"}
            required={!editId}
            className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
          <div className="flex gap-3 md:col-span-2">
            <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition">
              <Check size={16} /> {editId ? "Update User" : "Create User"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
              className="flex items-center gap-2 border px-6 py-2.5 rounded-lg hover:bg-gray-50 transition">
              <X size={16} /> Cancel
            </button>
          </div>
        </form>
      )}

      {/* View User Modal */}
      {viewUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">User Details</h2>
              <button onClick={() => setViewUser(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={28} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{viewUser.name}</p>
                <p className="text-gray-500">{viewUser.email}</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColors[viewUser.role]}`}>{viewUser.role}</span>
              </div>
            </div>
            <div className="mb-4 text-sm text-gray-500">
              <p>Joined: {new Date(viewUser.created_at).toLocaleDateString()}</p>
              <p>Total Orders: {viewUser.orders?.length || 0}</p>
              <p>Total Spent: {(viewUser.orders || []).reduce((s, o) => s + Number(o.total_amount), 0).toLocaleString()} RWF</p>
            </div>
            {viewUser.orders?.length > 0 && (
              <div>
                <p className="font-semibold mb-2 text-sm">Recent Orders</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {viewUser.orders.map((o) => (
                    <div key={o.id} className="flex justify-between text-sm border rounded-lg px-3 py-2">
                      <span>#{o.id} — {o.status}</span>
                      <span className="font-medium">{Number(o.total_amount).toLocaleString()} RWF</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <button onClick={() => handleEdit(viewUser)} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition">
                <Edit2 size={15} /> Edit
              </button>
              <button onClick={() => { setViewUser(null); handleDelete(viewUser.id); }} className="flex-1 flex items-center justify-center gap-2 border border-red-300 text-red-500 py-2.5 rounded-xl hover:bg-red-50 transition">
                <Trash2 size={15} /> Delete
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
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Joined</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={14} className="text-blue-600" />
                    </div>
                    <span className="font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColors[u.role]}`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => handleView(u.id)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition" title="View"><Eye size={15} /></button>
                    <button onClick={() => handleEdit(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit"><Edit2 size={15} /></button>
                    <button onClick={() => handleDelete(u.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && <p className="text-center text-gray-400 py-10">No users found</p>}
        {loading && <p className="text-center text-gray-400 py-10">Loading...</p>}
      </div>
    </div>
  );
}
