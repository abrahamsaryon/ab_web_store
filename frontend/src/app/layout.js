import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SiteNotice from "@/components/SiteNotice";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "AB WebStore",
  description: "Your one-stop online shop",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <SettingsProvider>
              <SiteNotice />
              <Navbar />
              <main className="min-h-screen">{children}</main>
              <Footer />
              <Toaster position="top-right" />
            </SettingsProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
