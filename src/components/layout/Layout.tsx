import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import MobileBottomNavigation from "./MobileBottomNavigation";
import fontPreloader from "../../utils/fontPreloader";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  React.useEffect(() => {
    // تحميل الخطوط في الخلفية عند تحميل Layout
    fontPreloader.preloadAllFonts().catch(console.warn);
  }, []);

  // Layout.tsx
  const isCustomizerPage = location.pathname === "/customizer";
  const isAdminPage =
    location.pathname === "/x9qPzRwT3mY2kV8nL5jF6hD4cB" ||
    (location.pathname.startsWith("/admin/orders/") &&
      location.pathname.endsWith("/edit"));

  const isTemporaryOrderEditPage = location.pathname.startsWith("/edit-order/");

  if (isCustomizerPage || isAdminPage || isTemporaryOrderEditPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pb-16 md:pb-0">
      <Header />
      <main className="flex-1 mb-safe">{children}</main>
      <Footer />
      <MobileBottomNavigation />
    </div>
  );
};

export default Layout;
