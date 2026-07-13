"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit2, X, Check, Search, Star, Upload, Link as LinkIcon } from "lucide-react";

const empty = { name: "", description: "", price: "", stock: "", category_id: "", whatsapp_enabled: false, whatsapp_number: "" };
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
  const [saving, setSaving] = useState(false);

  // Images state (within form)
  const [images, setImages] = useState([]);
  const [imgTab, setImgTab] = useState("url");
  const [imgUrl, setImgUrl] = useState("");
  const [imgFiles, setImgFiles] = useState([]);
  const [imgUploading, setImgUploading] = useState(false);
  const fileRef = useRef();

  // Variants state (within form)
  const [variants, setVariants] = useState([]);
  const [variantForm, setVariantForm] = useState(emptyVariant);
  const [editVariantId, setEditVariantId] = useState(null);
  const [savingVariant, setSavingVariant] = useState(false);

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

  const openForm = async (p = null) => {
    setEditId(p ? p.id : null);
    setForm(p ? {
      name: p.name, description: p.description || "", price: p.price,
      stock: p.stock, category_id: String(p.category_id),
      whatsapp_enabled: !!p.whatsapp_enabled, whatsapp_number: p.whatsapp_number || ""
    } : empty);
    setVariantForm(emptyVariant);
    setEditVariantId(null);
    setImgUrl(""); setImgFiles([]);

    if (p) {
      const [imgs, vars] = await Promise.all([
        api.get(`/products/${p.id}/images`),
        api.get(`/products/${p.id}/variants`),
      ]);
      setImages(imgs.data);
      setVariants(vars.data);
    } else {
      setImages([]);
      setVariants([]);
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false); setEditId(null); setForm(empty);
    setImages([]); setVariants([]); setVariantForm(emptyVariant); setEditVariantId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = editId
        ? await api.put(`/products/${editId}`, form)
        : await api.post("/products", form);
      const savedId = editId || res.data.id;
      if (!editId) {
        // Load images/variants panel for new product (it's now saved)
        setEditId(savedId);
      }
      toast.success(editId ? "Product updated" : "Product saved — now add images & variants below");
      await load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  // --- Images ---
  const handleAddImage = async () => {
    if (!editId) return toast.error("Save the product first");
    if (!imgUrl && imgFiles.length === 0) return toast.error("Provide a URL or select a file");
    setImgUploading(true);
    try {
      if (imgFiles.length > 0) {
        let currentCount = images.length;
        for (const file of imgFiles) {
          const fd = new FormData();
          fd.append("image", file);
          fd.append("folder", "ab_webstore/products");
          const r = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
          await api.post(`/products/${editId}/images`, { url: r.data.url, public_id: r.data.public_id, is_primary: currentCount === 0 ? 1 : 0 });
          currentCount++;
        }
        toast.success(imgFiles.length > 1 ? `${imgFiles.length} images added` : "Image added");
      } else {
        const r = await api.post("/upload", { url: imgUrl, folder: "ab_webstore/products" });
        await api.post(`/products/${editId}/images`, { url: r.data.url, public_id: r.data.public_id, is_primary: images.length === 0 ? 1 : 0 });
        toast.success("Image added");
      }
      setImgUrl(""); setImgFiles([]);
      const imgs = await api.get(`/products/${editId}/images`);
      setImages(imgs.data);
      await load();
    } catch (err) { toast.error(err.response?.data?.message || "Upload failed"); }
    finally { setImgUploading(false); }
  };

  const handleSetPrimary = async (imageId) => {
    await api.put(`/products/${editId}/images/${imageId}/primary`);
    const imgs = await api.get(`/products/${editId}/images`);
    setImages(imgs.data);
    await load();
    toast.success("Primary image set");
  };

  const handleDeleteImage = async (imageId) => {
    await api.delete(`/products/${editId}/images/${imageId}`);
    const imgs = await api.get(`/products/${editId}/images`);
    setImages(imgs.data);
    await load();
    toast.success("Image removed");
  };

  // --- Variants ---
  const handleVariantSubmit = async (e) => {
    e.preventDefault();
    if (!editId) return toast.error("Save the product first");
    setSavingVariant(true);
    try {
      if (editVariantId) {
        await api.put(`/products/${editId}/variants/${editVariantId}`, variantForm);
        toast.success("Variant updated");
      } else {
        await api.post(`/products/${editId}/variants`, variantForm);
        toast.success("Variant added");
      }
      setVariantForm(emptyVariant); setEditVariantId(null);
      const vars = await api.get(`/products/${editId}/variants`);
      setVariants(vars.data);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSavingVariant(false); }
  };

  const handleDeleteVariant = async (vid) => {
    await api.delete(`/products/${editId}/variants/${vid}`);
    const vars = await api.get(`/products/${editId}/variants`);
    setVariants(vars.data);
    toast.success("Variant deleted");
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
        <button onClick={() => openForm()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
          className="w-full pl-9 pr-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Combined Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">{editId ? "Edit Product" : "Add New Product"}</h2>
            <button type="button" onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>

          {/* Basic Info */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="md:col-span-2">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-60">
                <Check size={16} /> {saving ? "Saving..." : editId ? "Update Product" : "Save Product"}
              </button>
            </div>
          </form>

          {/* Images — only shown once product is saved (has editId) */}
          {editId && (
            <>
              <hr />
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-3">Product Images</h3>
                <div className="flex gap-3 flex-wrap mb-4">
                  {images.map((img) => (
                    <div key={img.id} className="relative group w-24 h-24 rounded-lg overflow-hidden border-2" style={{ borderColor: img.is_primary ? "#2563eb" : "transparent" }}>
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1">
                        {!img.is_primary && <button type="button" onClick={() => handleSetPrimary(img.id)} className="text-yellow-300 hover:text-yellow-100"><Star size={14} /></button>}
                        <button type="button" onClick={() => handleDeleteImage(img.id)} className="text-red-300 hover:text-red-100"><Trash2 size={14} /></button>
                      </div>
                      {img.is_primary && <span className="absolute bottom-0 left-0 right-0 text-center text-xs bg-blue-600 text-white py-0.5">Primary</span>}
                    </div>
                  ))}
                  {images.length === 0 && <p className="text-sm text-gray-400">No images yet</p>}
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex gap-2 mb-3">
                    <button type="button" onClick={() => setImgTab("url")} className={`text-sm px-3 py-1 rounded-lg flex items-center gap-1 ${imgTab === "url" ? "bg-blue-600 text-white" : "border hover:bg-gray-50"}`}><LinkIcon size={13} /> URL</button>
                    <button type="button" onClick={() => setImgTab("upload")} className={`text-sm px-3 py-1 rounded-lg flex items-center gap-1 ${imgTab === "upload" ? "bg-blue-600 text-white" : "border hover:bg-gray-50"}`}><Upload size={13} /> Upload</button>
                  </div>
                  {imgTab === "url" ? (
                    <input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="https://..." className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2" />
                  ) : (
                    <div className="mb-2">
                      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => setImgFiles(Array.from(e.target.files))} />
                      <button type="button" onClick={() => fileRef.current.click()} className="border rounded-lg px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-gray-500">
                        {imgFiles.length > 0 ? `${imgFiles.length} file${imgFiles.length > 1 ? "s" : ""} selected` : "Choose image file(s)..."}
                      </button>
                    </div>
                  )}
                  <button type="button" onClick={handleAddImage} disabled={imgUploading} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-60">
                    <Plus size={14} /> {imgUploading ? "Uploading..." : "Add Image"}
                  </button>
                </div>
              </div>

              {/* Variants */}
              <hr />
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-1">Product Variants</h3>
                <p className="text-xs text-gray-400 mb-3">e.g. Size: XL, Color: Red — price modifier adds/subtracts from base price</p>
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
                                <button type="button" onClick={() => { setVariantForm({ name: v.name, value: v.value, price_modifier: v.price_modifier, stock: v.stock, image_url: v.image_url || "" }); setEditVariantId(v.id); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={13} /></button>
                                <button type="button" onClick={() => handleDeleteVariant(v.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
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
                    <button type="submit" disabled={savingVariant} className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-60">
                      <Check size={13} /> {editVariantId ? "Update Variant" : "Add Variant"}
                    </button>
                    {editVariantId && <button type="button" onClick={() => { setVariantForm(emptyVariant); setEditVariantId(null); }} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50"><X size={13} /></button>}
                  </div>
                </form>
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={closeForm} className="flex items-center gap-2 border px-6 py-2.5 rounded-lg hover:bg-gray-50 transition text-sm"><X size={14} /> Done</button>
              </div>
            </>
          )}
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
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                    <img src={p.image_url || ""} alt={p.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.category_name}</td>
                <td className="px-4 py-3">{Number(p.price).toLocaleString()} RWF</td>
                <td className="px-4 py-3"><span className={`font-medium ${p.stock < 5 ? "text-red-500" : "text-green-600"}`}>{p.stock}</span></td>
                <td className="px-4 py-3">{p.whatsapp_enabled ? <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">On</span> : <span className="text-xs text-gray-300">Off</span>}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openForm(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit"><Edit2 size={15} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={15} /></button>
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
