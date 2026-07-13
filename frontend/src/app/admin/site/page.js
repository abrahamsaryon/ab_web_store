"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Check, Globe, Image, Bell, Phone, Share2 } from "lucide-react";
import ImageUploader from "@/components/ui/ImageUploader";

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

  useEffect(() => {
    if (!user) { router.push("/auth"); return; }
    if (user.role !== "admin") { router.push("/"); return; }
    api.get("/settings").then((r) => setForm(r.data));
  }, [user]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

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
          <>
            <Field label="Hero Title" name="hero_title" placeholder="Welcome to AB WebStore" />
            <Field label="Hero Subtitle" name="hero_subtitle" placeholder="Discover amazing products at unbeatable prices" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Banner Image</label>
              <ImageUploader value={form.hero_banner || ""} onChange={(url) => set("hero_banner", url)} folder="ab_webstore/banners" label="Banner" previewClass="w-full h-32 object-cover rounded-xl" />
            </div>
          </>
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
