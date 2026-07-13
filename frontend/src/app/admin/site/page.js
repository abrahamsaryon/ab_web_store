"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Check, Globe, Image, Bell, Phone, Share2, Plus, Trash2, Edit2, X, ChevronUp, ChevronDown } from "lucide-react";
import ImageUploader from "@/components/ui/ImageUploader";

const emptyBanner = { title: "", subtitle: "", button_text: "Shop Now", button_link: "/products", image_url: "", public_id: "", active: true };

const tabs = [
  { id: "general", label: "General", icon: Globe },
  { id: "hero", label: "Hero & Banner", icon: Image },
  { id: "notice", label: "Site Notice", icon: Bell },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "social", label: "Social Media", icon: Share2 },
];

export default function AdminSiteSettings() {
  const { user } = useAuth();
  const router = useRouter();
  const { settings: globalSettings, setSettings: setGlobalSettings } = useSettings();
  const [tab, setTab] = useState("general");
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [banners, setBanners] = useState([]);
  const [bannerForm, setBannerForm] = useState(emptyBanner);
  const [editBannerId, setEditBannerId] = useState(null);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/auth"); return; }
    if (user.role !== "admin") { router.push("/"); return; }
    api.get("/settings").then((r) => setForm(r.data));
    api.get("/banners").then((r) => setBanners(r.data));
  }, [user]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const loadBanners = () => api.get("/banners").then((r) => setBanners(r.data));

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    if (!bannerForm.image_url) return toast.error("Banner image is required");
    setSavingBanner(true);
    try {
      editBannerId
        ? await api.put(`/banners/${editBannerId}`, bannerForm)
        : await api.post("/banners", bannerForm);
      toast.success(editBannerId ? "Banner updated" : "Banner added");
      setShowBannerForm(false); setBannerForm(emptyBanner); setEditBannerId(null);
      loadBanners();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSavingBanner(false); }
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm("Delete this banner?")) return;
    await api.delete(`/banners/${id}`);
    loadBanners();
    toast.success("Banner deleted");
  };

  const handleToggleBanner = async (b) => {
    await api.put(`/banners/${b.id}`, { ...b, active: !b.active });
    loadBanners();
  };

  const handleMoveBanner = async (b, dir) => {
    const sorted = [...banners].sort((a, c) => a.sort_order - c.sort_order);
    const idx = sorted.findIndex((x) => x.id === b.id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    await Promise.all([
      api.put(`/banners/${b.id}`, { ...b, sort_order: swap.sort_order }),
      api.put(`/banners/${swap.id}`, { ...swap, sort_order: b.sort_order }),
    ]);
    loadBanners();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/settings", form);
      setGlobalSettings((prev) => ({ ...prev, ...form }));
      toast.success("Settings saved successfully");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally { setSaving(false); }
  };

  const Field = ({ label, name, type = "text", placeholder, hint }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <input type={type} value={form[name] || ""} onChange={(e) => set(name, e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Site Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition -mb-px whitespace-nowrap ${
              tab === id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow p-6 space-y-5">

        {/* General */}
        {tab === "general" && (
          <>
            <Field label="Site Name" name="site_name" placeholder="AB WebStore" />
            <Field label="Site Tagline" name="site_tagline" placeholder="Your one-stop online shop" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Logo</label>
              <ImageUploader value={form.site_logo || ""} onChange={(url) => set("site_logo", url)} folder="ab_webstore/logos" label="Logo" previewClass="h-12 w-12 object-contain rounded border" />
            </div>
            <Field label="Footer Text" name="footer_text" placeholder="© 2025 AB WebStore. All rights reserved." />
          </>
        )}

        {/* Hero & Banner */}
        {tab === "hero" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Hero Banners</p>
                <p className="text-xs text-gray-400">Banners rotate automatically on the homepage. Add multiple for a slider.</p>
              </div>
              <button type="button" onClick={() => { setShowBannerForm(true); setEditBannerId(null); setBannerForm(emptyBanner); }}
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                <Plus size={14} /> Add Banner
              </button>
            </div>

            {/* Banner list */}
            {banners.length === 0 && !showBannerForm && <p className="text-sm text-gray-400 text-center py-6">No banners yet. Add one above.</p>}
            <div className="space-y-3">
              {banners.map((b, i) => (
                <div key={b.id} className={`border rounded-xl overflow-hidden ${!b.active ? 'opacity-50' : ''}`}>
                  <div className="relative h-28">
                    <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center px-4">
                      <div className="text-white">
                        {b.title && <p className="font-bold">{b.title}</p>}
                        {b.subtitle && <p className="text-xs opacity-80">{b.subtitle}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => handleMoveBanner(b, -1)} disabled={i === 0} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><ChevronUp size={14} /></button>
                      <button type="button" onClick={() => handleMoveBanner(b, 1)} disabled={i === banners.length - 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><ChevronDown size={14} /></button>
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input type="checkbox" checked={!!b.active} onChange={() => handleToggleBanner(b)} className="accent-blue-600" />
                        Active
                      </label>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => { setBannerForm({ title: b.title || "", subtitle: b.subtitle || "", button_text: b.button_text || "Shop Now", button_link: b.button_link || "/products", image_url: b.image_url, public_id: b.public_id || "", active: !!b.active }); setEditBannerId(b.id); setShowBannerForm(true); }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={13} /></button>
                      <button type="button" onClick={() => handleDeleteBanner(b.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Banner form */}
            {showBannerForm && (
              <div className="border rounded-xl p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{editBannerId ? "Edit Banner" : "New Banner"}</p>
                  <button type="button" onClick={() => { setShowBannerForm(false); setEditBannerId(null); }} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Banner Image *</label>
                  <ImageUploader value={bannerForm.image_url} onChange={(url) => setBannerForm({ ...bannerForm, image_url: url })}
                    folder="ab_webstore/banners" label="Banner" previewClass="w-full h-28 object-cover rounded-lg" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    placeholder="Title (optional)" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input value={bannerForm.subtitle} onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                    placeholder="Subtitle (optional)" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input value={bannerForm.button_text} onChange={(e) => setBannerForm({ ...bannerForm, button_text: e.target.value })}
                    placeholder="Button text" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input value={bannerForm.button_link} onChange={(e) => setBannerForm({ ...bannerForm, button_link: e.target.value })}
                    placeholder="Button link (e.g. /products)" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button type="button" onClick={handleBannerSubmit} disabled={savingBanner}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-60">
                  <Check size={13} /> {savingBanner ? "Saving..." : editBannerId ? "Update Banner" : "Add Banner"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Site Notice */}
        {tab === "notice" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Notice / Announcement</label>
            <p className="text-xs text-gray-400 mb-2">This appears as a banner at the top of every page. Leave empty to hide.</p>
            <textarea value={form.site_notice || ""} onChange={(e) => set("site_notice", e.target.value)}
              placeholder="e.g. Free delivery on orders above 50,000 RWF! 🎉"
              rows={3}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {form.site_notice && (
              <div className="mt-3 bg-blue-600 text-white text-sm py-2 px-4 rounded-lg text-center">
                Preview: {form.site_notice}
              </div>
            )}
          </div>
        )}

        {/* Contact */}
        {tab === "contact" && (
          <>
            <Field label="Contact Email" name="contact_email" type="email" placeholder="info@abstore.com" />
            <Field label="Contact Phone" name="contact_phone" placeholder="+250 700 000 000" />
            <Field label="Address" name="contact_address" placeholder="Kigali, Rwanda" />
          </>
        )}

        {/* Social Media */}
        {tab === "social" && (
          <>
            <Field label="Facebook URL" name="facebook_url" placeholder="https://facebook.com/yourpage" />
            <Field label="Twitter / X URL" name="twitter_url" placeholder="https://twitter.com/yourhandle" />
            <Field label="Instagram URL" name="instagram_url" placeholder="https://instagram.com/yourhandle" />
          </>
        )}

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-60">
          <Check size={16} /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
