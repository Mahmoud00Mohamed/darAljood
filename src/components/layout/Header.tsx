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
  Images,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import logo from "/Photo/logo.png";

const Header: React.FC = () => {
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

  return (
    <header
      className={`bg-white sticky top-0 z-50 border-b border-gray-100 transition-shadow duration-300 ${
        showShadow ? "shadow-lg" : "shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={logo} alt="Logo" className="h-7 w-auto" />
            <span
              className="text-base sm:text-lg font-semibold text-[#563660] whitespace-nowrap"
              style={{ fontFamily: "'Scheherazade New', serif" }}
            >
              دار الجود
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 rtl:space-x-reverse">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 relative whitespace-nowrap ${
                    location.pathname === item.href
                      ? "text-[#563660] bg-[#563660]/5"
                      : "text-gray-600 hover:text-[#563660]"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xl:inline">{item.name}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
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
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0"
            aria-label="فتح القائمة"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
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
              className="lg:hidden fixed top-0 right-0 h-screen w-72 max-w-[85vw] bg-white shadow-lg z-50 overflow-y-auto"
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <img src={logo} alt="Logo" className="h-6 w-auto" />
                  <span
                    className="text-base font-semibold text-[#563660]"
                    style={{ fontFamily: "'Scheherazade New', serif" }}
                  >
                    دار الجود
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Menu Items */}
              <div className="p-4 space-y-2 flex-1 overflow-y-auto">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 relative ${
                        location.pathname === item.href
                          ? "text-[#563660] bg-[#563660]/5"
                          : "text-gray-600 hover:text-[#563660]"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
