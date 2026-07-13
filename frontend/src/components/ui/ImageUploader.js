"use client";
import { useRef, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Upload, Link as LinkIcon, X } from "lucide-react";

export default function ImageUploader({ value, onChange, folder = "ab_webstore/general", previewClass = "w-20 h-20 rounded-lg object-cover", label = "Image" }) {
  const [tab, setTab] = useState("upload");
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const upload = async (file) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("folder", folder);
      const r = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      onChange(r.data.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally { setUploading(false); }
  };

  const handleUrl = async () => {
    if (!urlInput.trim()) return;
    setUploading(true);
    try {
      const r = await api.post("/upload", { url: urlInput.trim(), folder });
      onChange(r.data.url);
      setUrlInput("");
      toast.success("Image saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save image");
    } finally { setUploading(false); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative inline-block">
          <img src={value} alt={label} className={previewClass} />
          <button type="button" onClick={() => onChange("")}
            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600">
            <X size={11} />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <button type="button" onClick={() => setTab("upload")}
          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition ${tab === "upload" ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-50"}`}>
          <Upload size={12} /> Upload
        </button>
        <button type="button" onClick={() => setTab("url")}
          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition ${tab === "url" ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-50"}`}>
          <LinkIcon size={12} /> URL
        </button>
      </div>

      {tab === "url" ? (
        <div className="flex gap-2">
          <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="button" onClick={handleUrl} disabled={uploading || !urlInput.trim()}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50">
            {uploading ? "..." : "Save"}
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
          className={`border-2 border-dashed rounded-lg px-4 py-6 text-center cursor-pointer transition ${
            dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          }`}>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files[0] && upload(e.target.files[0])} />
          <Upload size={20} className="mx-auto mb-1 text-gray-400" />
          <p className="text-sm text-gray-500">{uploading ? "Uploading..." : "Drag & drop or click to upload"}</p>
        </div>
      )}
    </div>
  );
}
