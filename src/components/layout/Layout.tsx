import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
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

  const isCustomizerPage = location.pathname === "/customizer";
  const isAdminPage =
    location.pathname === "/admin" ||
    (location.pathname.startsWith("/admin/orders/") &&
      location.pathname.endsWith("/edit"));

  if (isCustomizerPage || isAdminPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
