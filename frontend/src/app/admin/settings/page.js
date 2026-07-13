"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { User, Lock, Shield, Plus, Trash2, Edit2, X, Check, Eye, EyeOff } from "lucide-react";
import ImageUploader from "@/components/ui/ImageUploader";

export default function AdminSettings() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState({ name: "", email: "", avatar: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [admins, setAdmins] = useState([]);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "" });
  const [editAdminId, setEditAdminId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/auth"); return; }
    if (user.role !== "admin") { router.push("/"); return; }
    api.get("/profile").then((r) => setProfile({ name: r.data.name, email: r.data.email, avatar: r.data.avatar || "" }));
    loadAdmins();
  }, [user]);

  const loadAdmins = () => {
    api.get("/users").then((r) => setAdmins((r.data || []).filter((u) => u.role === "admin")));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/profile", profile);
      login({ ...user, name: profile.name, email: profile.email }, localStorage.getItem("token"));
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword)
      return toast.error("New passwords do not match");
    if (passwords.newPassword.length < 6)
      return toast.error("Password must be at least 6 characters");
    setSaving(true);
    try {
      await api.put("/profile/password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally { setSaving(false); }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editAdminId) {
        const payload = { name: adminForm.name, email: adminForm.email, role: "admin" };
        if (adminForm.password) payload.password = adminForm.password;
        await api.put(`/users/${editAdminId}`, payload);
        toast.success("Admin updated");
      } else {
        await api.post("/users", { ...adminForm, role: "admin" });
        toast.success("Admin created");
      }
      setShowAdminForm(false);
      setAdminForm({ name: "", email: "", password: "" });
      setEditAdminId(null);
      loadAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (id === user.id) return toast.error("You cannot delete your own account");
    if (!confirm("Delete this admin?")) return;
    await api.delete(`/users/${id}`);
    toast.success("Admin deleted");
    loadAdmins();
  };

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "password", label: "Change Password", icon: Lock },
    { id: "admins", label: "Admin Team", icon: Shield },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition -mb-px ${
              tab === id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === "profile" && (
        <form onSubmit={handleProfileSave} className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
              {profile.avatar ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" /> : <User size={28} className="text-blue-600" />}
            </div>
            <div>
              <p className="font-bold text-lg">{user?.name}</p>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Admin</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
            <ImageUploader value={profile.avatar || ""} onChange={(url) => setProfile({ ...profile, avatar: url })} folder="ab_webstore/avatars" label="Avatar" previewClass="w-16 h-16 rounded-full object-cover border" />
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-60">
            <Check size={16} /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {/* Password Tab */}
      {tab === "password" && (
        <form onSubmit={handlePasswordChange} className="bg-white rounded-xl shadow p-6 space-y-4">
          <p className="text-sm text-gray-500 mb-2">Use a strong password with at least 6 characters including letters and numbers.</p>
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

      {/* Admin Team Tab */}
      {tab === "admins" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">Manage admin accounts for your store.</p>
            <button onClick={() => { setShowAdminForm(true); setEditAdminId(null); setAdminForm({ name: "", email: "", password: "" }); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
              <Plus size={15} /> Add Admin
            </button>
          </div>

          {showAdminForm && (
            <form onSubmit={handleAdminSubmit} className="bg-white rounded-xl shadow p-5 mb-4 space-y-3" autoComplete="off">
              <h3 className="font-semibold">{editAdminId ? "Edit Admin" : "New Admin"}</h3>
              <input required value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                placeholder="Full Name" autoComplete="off"
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input required={!editAdminId} type="email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                placeholder="Email Address" autoComplete="off"
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                placeholder={editAdminId ? "New Password (leave blank to keep)" : "Password *"}
                required={!editAdminId} autoComplete="new-password"
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="flex gap-3">
                <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition text-sm"><Check size={14} /> Save</button>
                <button type="button" onClick={() => { setShowAdminForm(false); setEditAdminId(null); }} className="flex items-center gap-2 border px-5 py-2 rounded-lg hover:bg-gray-50 transition text-sm"><X size={14} /> Cancel</button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b">
                <tr>
                  <th className="text-left px-4 py-3">Admin</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Joined</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {admins.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center">
                          <Shield size={12} className="text-purple-600" />
                        </div>
                        <span className="font-medium">{a.name}</span>
                        {a.id === user?.id && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">You</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{a.email}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(a.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setAdminForm({ name: a.name, email: a.email, password: "" }); setEditAdminId(a.id); setShowAdminForm(true); }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={14} /></button>
                        {a.id !== user?.id && (
                          <button onClick={() => handleDeleteAdmin(a.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
