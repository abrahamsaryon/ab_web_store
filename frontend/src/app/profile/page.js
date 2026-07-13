"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { User, Lock, Check, Eye, EyeOff } from "lucide-react";

export default function ProfilePage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState({ name: "", email: "", avatar: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/auth"); return; }
    api.get("/profile").then((r) => setProfile({ name: r.data.name, email: r.data.email, avatar: r.data.avatar || "" }));
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/profile", profile);
      login({ ...user, name: profile.name, email: profile.email }, localStorage.getItem("token"));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error("Passwords do not match");
    if (passwords.newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setSaving(true);
    try {
      await api.put("/profile/password", { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success("Password changed successfully");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {[{ id: "profile", label: "Profile", icon: User }, { id: "password", label: "Change Password", icon: Lock }].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition -mb-px ${
              tab === id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <form onSubmit={handleProfileSave} className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
              {profile.avatar ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" /> : <User size={28} className="text-blue-600" />}
            </div>
            <div>
              <p className="font-bold">{user?.name}</p>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Customer</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input required value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input required type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
            <input value={profile.avatar} onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
              placeholder="https://example.com/photo.jpg"
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-60">
            <Check size={16} /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {tab === "password" && (
        <form onSubmit={handlePasswordChange} className="bg-white rounded-xl shadow p-6 space-y-4">
          <p className="text-sm text-gray-500">Use a strong password with at least 6 characters.</p>
          {[
            { key: "currentPassword", label: "Current Password", show: showPw.current, toggle: () => setShowPw({ ...showPw, current: !showPw.current }) },
            { key: "newPassword", label: "New Password", show: showPw.new, toggle: () => setShowPw({ ...showPw, new: !showPw.new }) },
            { key: "confirmPassword", label: "Confirm New Password", show: showPw.confirm, toggle: () => setShowPw({ ...showPw, confirm: !showPw.confirm }) },
          ].map(({ key, label, show, toggle }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <div className="relative">
                <input required type={show ? "text" : "password"} value={passwords[key]}
                  onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                  autoComplete="new-password"
                  className="w-full border rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-60">
            <Lock size={16} /> {saving ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}
    </div>
  );
}
