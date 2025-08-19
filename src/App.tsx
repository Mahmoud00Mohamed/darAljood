import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { JacketProvider } from "./context/JacketContext";
import { CartProvider } from "./context/CartContext";
import { ImageLibraryProvider } from "./context/ImageLibraryContext";
import fontPreloader from "./utils/fontPreloader";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import CustomizerPage from "./pages/CustomizerPage";
import AboutPage from "./pages/AboutPage";
import CartPage from "./pages/CartPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import TermsPage from "./pages/TermsPage";
import ReturnPolicyPage from "./pages/ReturnPolicyPage";
import CloudinaryTestPage from "./pages/CloudinaryTestPage";
import ImageLibraryPage from "./pages/ImageLibraryPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import OrderEditPage from "./pages/OrderEditPage";
import TemporaryOrderEditPage from "./pages/TemporaryOrderEditPage";

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  // تحميل الخطوط عند بدء التطبيق
  useEffect(() => {
    const initializeFonts = async () => {
      try {
        await fontPreloader.preloadAllFonts();
      } catch {
        // خطأ في تحميل الخطوط
      }
    };
    initializeFonts();
  }, []);

  return (
    <JacketProvider>
      <CartProvider>
        <ImageLibraryProvider>
          <Router>
            <Layout>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/customizer" element={<CustomizerPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/return-policy" element={<ReturnPolicyPage />} />
                <Route
                  path="/cloudinary-test"
                  element={<CloudinaryTestPage />}
                />
                <Route path="/image-library" element={<ImageLibraryPage />} />
                <Route
                  path="/x9qPzRwT3mY2kV8nL5jF6hD4cB"
                  element={<AdminPanelPage />}
                />
                <Route path="/track-order" element={<OrderTrackingPage />} />
                <Route
                  path="/admin/orders/:orderId/edit"
                  element={
                    <div className="min-h-screen">
                      <OrderEditPage />
                    </div>
                  }
                />
                <Route
                  path="/edit-order/:token"
                  element={
                    <div className="min-h-screen">
                      <TemporaryOrderEditPage />
                    </div>
                  }
                />
              </Routes>
            </Layout>
          </Router>
        </ImageLibraryProvider>
      </CartProvider>
    </JacketProvider>
  );
}

export default App;
