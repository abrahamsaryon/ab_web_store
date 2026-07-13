"use client";
import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

const SettingsContext = createContext({});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    site_name: "AB WebStore",
    site_tagline: "Your one-stop online shop",
    site_logo: "",
    hero_title: "Welcome to AB WebStore",
    hero_subtitle: "Discover amazing products at unbeatable prices",
    hero_banner: "",
    site_notice: "",
    contact_email: "info@abstore.com",
    contact_phone: "+250 700 000 000",
    contact_address: "Kigali, Rwanda",
    facebook_url: "",
    twitter_url: "",
    instagram_url: "",
    footer_text: "© 2025 AB WebStore. All rights reserved.",
  });

  useEffect(() => {
    api.get("/settings").then((r) => setSettings((prev) => ({ ...prev, ...r.data }))).catch(() => {});
  }, []);

  return <SettingsContext.Provider value={{ settings, setSettings }}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
