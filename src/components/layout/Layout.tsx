import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Home,
  Palette,
  Info,
  ShoppingCart,
  Phone,
  HelpCircle,
  Menu,
  X,
  Instagram,
} from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { Images } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import logo from "/Photo/logo.png";
import fontPreloader from "../../utils/fontPreloader";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { getTotalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showShadow, setShowShadow] = React.useState(false);

  const mobileMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowShadow(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    // تحميل الخطوط في الخلفية عند تحميل Layout
    fontPreloader.preloadAllFonts().catch(console.warn);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const totalItems = getTotalItems();

  const navigation = [
    { name: "الرئيسية", href: "/", icon: Home },
    { name: "التخصيص", href: "/customizer", icon: Palette },
    { name: "تتبع الطلب", href: "/track-order", icon: Search },
    { name: "مكتبة الصور", href: "/image-library", icon: Images },
    { name: "معلومات عنا", href: "/about", icon: Info },
    {
      name: "عربة التسوق",
      href: "/cart",
      icon: ShoppingCart,
      badge: totalItems > 0 ? totalItems : null,
    },
    { name: "اتصل بنا", href: "/contact", icon: Phone },
    { name: "الأسئلة الشائعة", href: "/faq", icon: HelpCircle },
  ];

  const footerLinks = {
    policies: [
      { name: "شروط الاستخدام", href: "/terms" },
      { name: "سياسة الإرجاع", href: "/return-policy" },
    ],
    social: [
      {
        name: "Instagram",
        href: "https://www.instagram.com/dar_algood",
        icon: Instagram,
      },
      {
        name: "TikTok",
        href: "https://www.tiktok.com/@dar_algood",
        icon: FaTiktok,
      },
    ],
  };

  const isCustomizerPage = location.pathname === "/customizer";
  const isAdminPage = location.pathname === "/admin";

  if (isCustomizerPage || isAdminPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header
        className={`bg-white/95 backdrop-blur-md sticky top-0 z-50 transition-shadow duration-300 ${
          showShadow ? "shadow-lg" : "shadow-none"
        } border-b border-gray-200`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img src={logo} alt="Logo" className="h-8 w-auto" />
              <span
                className="text-lg sm:text-xl font-bold text-transparent bg-gradient-to-r from-[#563660] to-[#7e4a8c] bg-clip-text whitespace-nowrap"
                style={{ fontFamily: "'Scheherazade New', serif" }}
              >
                دار الجود
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 rtl:space-x-reverse">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative whitespace-nowrap ${
                      location.pathname === item.href
                        ? "text-[#563660] bg-[#563660]/10"
                        : "text-gray-700 hover:text-[#563660] hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden xl:inline">{item.name}</span>
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="فتح القائمة"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              {/* Menu Panel */}
              <motion.div
                ref={mobileMenuRef}
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 overflow-y-auto"
              >
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <img src={logo} alt="Logo" className="h-6 w-auto" />
                    <span
                      className="text-lg font-bold text-transparent bg-gradient-to-r from-[#563660] to-[#7e4a8c] bg-clip-text"
                      style={{ fontFamily: "'Scheherazade New', serif" }}
                    >
                      دار الجود
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Menu Items */}
                <div className="p-4 space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                          location.pathname === item.href
                            ? "text-[#563660] bg-[#563660]/10 border border-[#563660]/20"
                            : "text-gray-700 hover:text-[#563660] hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Mobile Menu Footer */}
                <div className="mt-auto p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
                    {footerLinks.social.map((social) => {
                      const Icon = social.icon;
                      return (
                        <a
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center hover:bg-[#563660] hover:text-white transition-colors duration-200"
                        >
                          <Icon className="w-5 h-5" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-[#1a1a1a] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg')] bg-cover bg-center opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-4 sm:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center gap-2">
                <img
                  src={logo}
                  alt="Logo"
                  className="h-10 w-auto flex-shrink-0"
                />
                <span
                  className="text-xl sm:text-2xl font-bold text-transparent bg-gradient-to-r from-[#563660] to-[#7e4a8c] bg-clip-text"
                  style={{ fontFamily: "'Scheherazade New', serif" }}
                >
                  دار الجود
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
                صمم جاكيتك المثالي مع دار الجود، حيث الإبداع يلتقي بالجودة
                العالية لتعبر عن أسلوبك الفريد.
              </p>
              <div className="flex space-x-4 rtl:space-x-reverse">
                {footerLinks.social.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-[#563660] transition-colors duration-200 flex-shrink-0"
                      aria-label={social.name}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </a>
                  );
                })}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold bg-gradient-to-r from-[#563660] to-[#7e4a8c] bg-clip-text text-transparent">
                روابط سريعة
              </h3>
              <ul className="space-y-2">
                {navigation.slice(0, 6).map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-gray-300 hover:text-[#563660] transition-colors duration-200 text-sm block py-1"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Policies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold bg-gradient-to-r from-[#563660] to-[#7e4a8c] bg-clip-text text-transparent">
                السياسات
              </h3>
              <ul className="space-y-2">
                {footerLinks.policies.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-[#563660] transition-colors duration-200 text-sm block py-1"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold bg-gradient-to-r from-[#563660] to-[#7e4a8c] bg-clip-text text-transparent">
                ابدأ التصميم الآن
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                جاهز لتصميم جاكيتك الخاص؟ انقر أدناه لبدء رحلتك!
              </p>
              <Link
                to="/customizer"
                className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white font-medium text-sm rounded-lg hover:from-[#4b2e55] hover:to-[#6d3f7a] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Palette className="mr-2 w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">صمم الآن</span>
              </Link>
            </motion.div>
          </div>

          {/* Footer Bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="border-t border-gray-800 mt-10 pt-6 text-center"
          >
            <p className="text-gray-400 text-sm">
              © 2025 دار الجود. جميع الحقوق محفوظة.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
