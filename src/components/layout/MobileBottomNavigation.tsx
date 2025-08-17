import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Palette, Images, Search, ShoppingCart } from "lucide-react";
import { useCart } from "../../context/CartContext";

const MobileBottomNavigation: React.FC = () => {
  const { pathname } = useLocation();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  const navigationItems = [
    { name: "الرئيسية", href: "/", icon: Home },
    { name: "التخصيص", href: "/customizer", icon: Palette },
    { name: "المكتبة", href: "/image-library", icon: Images },
    { name: "تتبع الطلب", href: "/track-order", icon: Search },
    {
      name: "السلة",
      href: "/cart",
      icon: ShoppingCart,
      badge: totalItems || null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.href}
              className="relative flex flex-col items-center justify-center p-2 min-w-0 flex-1"
            >
              {/* Active Background */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeBackground"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute inset-0 bg-[#563660]/5 rounded-xl"
                  />
                )}
              </AnimatePresence>

              {/* Icon Container */}
              <div className="relative mb-1">
                <motion.div
                  animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`transition-colors duration-200 ${
                    isActive ? "text-[#563660]" : "text-gray-500"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>

                {/* Badge */}
                {item.badge && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                      {item.badge}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-medium transition-colors duration-200 ${
                  isActive ? "text-[#563660]" : "text-gray-600"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNavigation;
