import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Instagram, Palette } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import logo from "/Photo/logo.png";

const Footer: React.FC = () => {
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

  const navigation = [
    { name: "الرئيسية", href: "/" },
    { name: "التخصيص", href: "/customizer" },
    { name: "تتبع الطلب", href: "/track-order" },
    { name: "مكتبة الصور", href: "/image-library" },
    { name: "معلومات عنا", href: "/about" },
    { name: "اتصل بنا", href: "/contact" },
  ];

  return (
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
              صمم جاكيتك المثالي مع دار الجود، حيث الإبداع يلتقي بالجودة العالية
              لتعبر عن أسلوبك الفريد.
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
  );
};

export default Footer;
