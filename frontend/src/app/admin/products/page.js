"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit2, X, Check, Search, Images, Star, Upload, Link as LinkIcon } from "lucide-react";
import Image from "next/image";

const empty = { name: "", description: "", price: "", stock: "", image_url: "", category_id: "", whatsapp_enabled: false, whatsapp_number: "" };
const emptyVariant = { name: "", value: "", price_modifier: 0, stock: 0, image_url: "" };

export default function AdminProducts() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  // Media panel
  const [mediaProductId, setMediaProductId] = useState(null);
  const [mediaProductName, setMediaProductName] = useState("");
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [imgTab, setImgTab] = useState("url"); // "url" | "upload"
  const [imgUrl, setImgUrl] = useState("");
  const [imgFile, setImgFile] = useState(null);
  const [imgUploading, setImgUploading] = useState(false);
  const [variantForm, setVariantForm] = useState(emptyVariant);
  const [editVariantId, setEditVariantId] = useState(null);
  const fileRef = useRef();

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
      const res = editId
        ? await api.put(`/products/${editId}`, form)
        : await api.post("/products", form);
      const savedId = editId || res.data.id;
      const savedName = form.name;
      toast.success(editId ? "Product updated" : "Product added");
      setShowForm(false); setForm(empty); setEditId(null);
      await load();
      // Open media panel: for new products always, for edits keep it open if already on same product
      if (!editId || mediaProductId === savedId) {
        openMedia({ id: savedId, name: savedName });
      }
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, description: p.description || "", price: p.price, stock: p.stock, image_url: p.image_url || "", category_id: String(p.category_id), whatsapp_enabled: !!p.whatsapp_enabled, whatsapp_number: p.whatsapp_number || "" });
    setEditId(p.id); setShowForm(true);
    // Close media panel if it was open for a different product
    if (mediaProductId && mediaProductId !== p.id) setMediaProductId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`); toast.success("Deleted"); load();
  };

  // --- Media panel ---
  const openMedia = async (p) => {
    setMediaProductId(p.id);
    setMediaProductName(p.name);
    await loadMedia(p.id);
  };

  const loadMedia = async (pid) => {
    const [imgs, vars] = await Promise.all([
      api.get(`/products/${pid}/images`),
      api.get(`/products/${pid}/variants`),
    ]);
    setImages(imgs.data);
    setVariants(vars.data);
  };

  const handleAddImage = async () => {
    if (!imgUrl && !imgFile) return toast.error("Provide a URL or select a file");
    setImgUploading(true);
    try {
      let url, public_id;
      if (imgFile) {
        const fd = new FormData();
        fd.append("image", imgFile);
        const r = await api.post("/products/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        url = r.data.url; public_id = r.data.public_id;
      } else {
        const r = await api.post("/products/upload", { url: imgUrl });
        url = r.data.url; public_id = r.data.public_id;
      }
      await api.post(`/products/${mediaProductId}/images`, { url, public_id, is_primary: images.length === 0 ? 1 : 0 });
      setImgUrl(""); setImgFile(null);
      await loadMedia(mediaProductId);
      toast.success("Image added");
    } catch (err) { toast.error(err.response?.data?.message || "Upload failed"); }
    finally { setImgUploading(false); }
  };

  const handleSetPrimary = async (imageId) => {
    await api.put(`/products/${mediaProductId}/images/${imageId}/primary`);
    await loadMedia(mediaProductId);
    toast.success("Primary image set");
  };

  const handleDeleteImage = async (imageId) => {
    await api.delete(`/products/${mediaProductId}/images/${imageId}`);
    await loadMedia(mediaProductId);
    toast.success("Image removed");
  };

  const handleVariantSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editVariantId) {
        await api.put(`/products/${mediaProductId}/variants/${editVariantId}`, variantForm);
        toast.success("Variant updated");
      } else {
        await api.post(`/products/${mediaProductId}/variants`, variantForm);
        toast.success("Variant added");
      }
      setVariantForm(emptyVariant); setEditVariantId(null);
      await loadMedia(mediaProductId);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleDeleteVariant = async (vid) => {
    await api.delete(`/products/${mediaProductId}/variants/${vid}`);
    await loadMedia(mediaProductId);
    toast.success("Variant deleted");
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(empty); setMediaProductId(null); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
          className="w-full pl-9 pr-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Product Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <h2 className="md:col-span-2 font-semibold text-lg">{editId ? "Edit Product" : "Add New Product"}</h2>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product Name" className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select Category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Base Price (RWF)" className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Default Stock" className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2" />
          <div className="md:col-span-2 border rounded-lg p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.whatsapp_enabled} onChange={(e) => setForm({ ...form, whatsapp_enabled: e.target.checked })} className="w-4 h-4 accent-green-500" />
              <span className="font-medium text-sm">Enable WhatsApp Buy Button</span>
            </label>
            {form.whatsapp_enabled && (
              <input value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                placeholder="WhatsApp number — leave blank to use platform default"
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
            )}
          </div>
          <div className="flex gap-3 md:col-span-2">
            <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition"><Check size={16} /> {editId ? "Update" : "Save & Add Images"}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="flex items-center gap-2 border px-6 py-2.5 rounded-lg hover:bg-gray-50 transition"><X size={16} /> Cancel</button>
          </div>
        </form>
      )}

      {/* Media Panel */}
      {mediaProductId && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2"><Images size={18} /> Images & Variants — {mediaProductName}</h2>
            <button onClick={() => setMediaProductId(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>

          {/* Images */}
          <div className="mb-6">
            <h3 className="font-medium text-sm text-gray-600 mb-3">Product Images</h3>
            <div className="flex gap-3 flex-wrap mb-4">
              {images.map((img) => (
                <div key={img.id} className="relative group w-24 h-24 rounded-lg overflow-hidden border-2 border-transparent" style={img.is_primary ? { borderColor: "#2563eb" } : {}}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1">
                    {!img.is_primary && (
                      <button onClick={() => handleSetPrimary(img.id)} title="Set primary" className="text-yellow-300 hover:text-yellow-100"><Star size={14} /></button>
                    )}
                    <button onClick={() => handleDeleteImage(img.id)} className="text-red-300 hover:text-red-100"><Trash2 size={14} /></button>
                  </div>
                  {img.is_primary && <span className="absolute bottom-0 left-0 right-0 text-center text-xs bg-blue-600 text-white py-0.5">Primary</span>}
                </div>
              ))}
            </div>

            {/* Add image */}
            <div className="border rounded-lg p-4">
              <div className="flex gap-2 mb-3">
                <button onClick={() => setImgTab("url")} className={`text-sm px-3 py-1 rounded-lg flex items-center gap-1 ${imgTab === "url" ? "bg-blue-600 text-white" : "border hover:bg-gray-50"}`}><LinkIcon size={13} /> URL</button>
                <button onClick={() => setImgTab("upload")} className={`text-sm px-3 py-1 rounded-lg flex items-center gap-1 ${imgTab === "upload" ? "bg-blue-600 text-white" : "border hover:bg-gray-50"}`}><Upload size={13} /> Upload</button>
              </div>
              {imgTab === "url" ? (
                <input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="https://..." className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2" />
              ) : (
                <div className="mb-2">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setImgFile(e.target.files[0])} />
                  <button type="button" onClick={() => fileRef.current.click()} className="border rounded-lg px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-gray-500">
                    {imgFile ? imgFile.name : "Choose image file..."}
                  </button>
                </div>
              )}
              <button onClick={handleAddImage} disabled={imgUploading} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-60">
                <Plus size={14} /> {imgUploading ? "Uploading..." : "Add Image"}
              </button>
            </div>
          </div>

          {/* Variants */}
          <div>
            <h3 className="font-medium text-sm text-gray-600 mb-3">Product Variants <span className="text-xs text-gray-400">(e.g. Size: S, Color: Red — price modifier adds to base price)</span></h3>
            {variants.length > 0 && (
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm border rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left px-3 py-2">Name</th>
                      <th className="text-left px-3 py-2">Value</th>
                      <th className="text-left px-3 py-2">Price +/-</th>
                      <th className="text-left px-3 py-2">Stock</th>
                      <th className="text-left px-3 py-2">Image URL</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {variants.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">{v.name}</td>
                        <td className="px-3 py-2">{v.value}</td>
                        <td className="px-3 py-2">{Number(v.price_modifier) >= 0 ? "+" : ""}{Number(v.price_modifier).toLocaleString()} RWF</td>
                        <td className="px-3 py-2">{v.stock}</td>
                        <td className="px-3 py-2 max-w-[120px] truncate text-gray-400">{v.image_url || "—"}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <button onClick={() => { setVariantForm({ name: v.name, value: v.value, price_modifier: v.price_modifier, stock: v.stock, image_url: v.image_url || "" }); setEditVariantId(v.id); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={13} /></button>
                            <button onClick={() => handleDeleteVariant(v.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <form onSubmit={handleVariantSubmit} className="border rounded-lg p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
              <input required value={variantForm.name} onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })} placeholder="Name (e.g. Size)" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input required value={variantForm.value} onChange={(e) => setVariantForm({ ...variantForm, value: e.target.value })} placeholder="Value (e.g. XL)" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" value={variantForm.price_modifier} onChange={(e) => setVariantForm({ ...variantForm, price_modifier: e.target.value })} placeholder="Price +/- RWF" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" value={variantForm.stock} onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })} placeholder="Stock" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input value={variantForm.image_url} onChange={(e) => setVariantForm({ ...variantForm, image_url: e.target.value })} placeholder="Image URL (optional)" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2 md:col-span-1" />
              <div className="col-span-2 md:col-span-5 flex gap-2">
                <button type="submit" className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"><Check size={13} /> {editVariantId ? "Update Variant" : "Add Variant"}</button>
                {editVariantId && <button type="button" onClick={() => { setVariantForm(emptyVariant); setEditVariantId(null); }} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50"><X size={13} /></button>}
              </div>
            </form>
          </div>
        </div>
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
              <th className="text-left px-4 py-3">WA</th>
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
                <td className="px-4 py-3"><span className={`font-medium ${p.stock < 5 ? "text-red-500" : "text-green-600"}`}>{p.stock}</span></td>
                <td className="px-4 py-3">{p.whatsapp_enabled ? <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">On</span> : <span className="text-xs text-gray-300">Off</span>}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={15} /></button>
                    <button onClick={() => openMedia(p)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition" title="Images & Variants"><Images size={15} /></button>
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
