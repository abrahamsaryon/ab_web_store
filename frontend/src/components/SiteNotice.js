"use client";
import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { X } from "lucide-react";

export default function SiteNotice() {
  const { settings } = useSettings();
  const [dismissed, setDismissed] = useState(false);

  if (!settings.site_notice || dismissed) return null;

  return (
    <div className="bg-blue-600 text-white text-sm py-2 px-4 flex items-center justify-between">
      <span className="flex-1 text-center">{settings.site_notice}</span>
      <button onClick={() => setDismissed(true)} className="ml-4 hover:text-blue-200">
        <X size={16} />
      </button>
    </div>
  );
}
