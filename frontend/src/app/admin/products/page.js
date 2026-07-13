"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit2, X, Check, Search } from "lucide-react";
import Image from "next/image";

const empty = { name: "", description: "", price: "", stock: "", image_url: "", category_id: "", whatsapp_enabled: false, whatsapp_number: "" };

export default function AdminProducts() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) { router.push("/auth"); return; }
    if (user.role !== "admin") { router.push("/"); return; }
    load();
  }, [user]);

  const load = async () => {
    const [p, c] = await Promise.all([api.get("/products?limit=100"), api.get("/categories")]);
    setProducts(p.data.products || []);
    setCategories(c.data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      editId ? await api.put(`/products/${editId}`, form) : await api.post("/products", form);
      toast.success(editId ? "Product updated" : "Product added");
      setShowForm(false); setForm(empty); setEditId(null); load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, description: p.description || "", price: p.price, stock: p.stock, image_url: p.image_url || "", category_id: p.category_id, whatsapp_enabled: !!p.whatsapp_enabled, whatsapp_number: p.whatsapp_number || "" });
    setEditId(p.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`); toast.success("Deleted"); load();
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(empty); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
          className="w-full pl-9 pr-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <h2 className="md:col-span-2 font-semibold text-lg">{editId ? "Edit Product" : "Add New Product"}</h2>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product Name" className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select Category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (RWF)" className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock Quantity" className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Image URL (https://...)" className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2" />
          <div className="md:col-span-2 border rounded-lg p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.whatsapp_enabled} onChange={(e) => setForm({ ...form, whatsapp_enabled: e.target.checked })}
                className="w-4 h-4 accent-green-500" />
              <span className="font-medium text-sm">Enable WhatsApp Buy Button</span>
            </label>
            {form.whatsapp_enabled && (
              <input value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                placeholder="WhatsApp number (e.g. +250700000000) — leave blank to use platform default"
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
            )}
          </div>
          <div className="flex gap-3 md:col-span-2">
            <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition"><Check size={16} /> {editId ? "Update" : "Add Product"}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="flex items-center gap-2 border px-6 py-2.5 rounded-lg hover:bg-gray-50 transition"><X size={16} /> Cancel</button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="text-left px-4 py-3">Image</th>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Price</th>
              <th className="text-left px-4 py-3">Stock</th>
              <th className="text-left px-4 py-3">WhatsApp</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                    <Image src={p.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100"} alt={p.name} fill className="object-cover" />
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.category_name}</td>
                <td className="px-4 py-3">{Number(p.price).toLocaleString()} RWF</td>
                <td className="px-4 py-3">
                  <span className={`font-medium ${p.stock < 5 ? "text-red-500" : "text-green-600"}`}>{p.stock}</span>
                </td>
                <td className="px-4 py-3">
                  {p.whatsapp_enabled ? <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">On</span> : <span className="text-xs text-gray-300">Off</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={15} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-400 py-10">No products found</p>}
      </div>
    </div>
  );
}
