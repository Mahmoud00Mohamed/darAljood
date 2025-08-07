import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
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
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const totalItems = getTotalItems();

  const navigation = [
    { name: "الرئيسية", href: "/", icon: Home },
    { name: "التخصيص", href: "/customizer", icon: Palette },
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

  if (isCustomizerPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <header
        className={`bg-white/95 backdrop-blur-md sticky top-0 z-50 transition-shadow duration-300 ${
          showShadow ? "shadow-lg" : "shadow-none"
        } border-b border-gray-200`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-[1px]">
              <img src={logo} alt="Logo" className="h-8 w-auto" />
              <span
                className="text-xl font-bold text-transparent bg-gradient-to-r from-[#563660] to-[#7e4a8c] bg-clip-text"
                style={{ fontFamily: "'Scheherazade New', serif" }}
              >
                دار الجود
              </span>
            </Link>

            <nav className="hidden md:flex space-x-8 rtl:space-x-reverse">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                      location.pathname === item.href
                        ? "text-[#563660] bg-[#563660]/10"
                        : "text-gray-700 hover:text-[#563660] hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-200"
            >
              <div className="px-4 py-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                        location.pathname === item.href
                          ? "text-[#563660] bg-[#563660]/10"
                          : "text-gray-700 hover:text-[#563660] hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-gradient-to-br from-gray-900 to-[#1a1a1a] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg')] bg-cover bg-center opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <img src={logo} alt="Logo" className="h-10 w-auto" />
                <span
                  className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#563660] to-[#7e4a8c] bg-clip-text"
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
                      className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-[#563660] transition-colors duration-200"
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </a>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-[#563660] to-[#7e4a8c] bg-clip-text text-transparent">
                روابط سريعة
              </h3>
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-gray-300 hover:text-[#563660] transition-colors duration-200 text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-[#563660] to-[#7e4a8c] bg-clip-text text-transparent">
                السياسات
              </h3>
              <ul className="space-y-2">
                {footerLinks.policies.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-[#563660] transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-[#563660] to-[#7e4a8c] bg-clip-text text-transparent">
                ابدأ التصميم الآن
              </h3>
              <p className="text-gray-300 text-sm">
                جاهز لتصميم جاكيتك الخاص؟ انقر أدناه لبدء رحلتك!
              </p>
              <Link
                to="/customizer"
                className="inline-flex items-center justify-center px-6 py-2 bg-white text-[#563660] font-medium text-sm rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                صمم الآن
                <Palette className="mr-2 w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-400"
          >
            <p className="text-sm">© 2025 دار الجود. جميع الحقوق محفوظة.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
