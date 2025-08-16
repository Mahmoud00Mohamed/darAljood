import React from "react";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "/Photo/logo.png";

const TopBar: React.FC = () => {
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/966536065766", "_blank");
  };

  return (
    <div className="h-[30px] bg-gradient-to-r from-[#563660] to-[#7e4a8c] flex items-center justify-between px-4 text-white text-xs relative z-[100]">
      {/* الشعار واسم الموقع */}
      <Link
        to="/"
        className="flex items-center gap-2 hover:opacity-80 transition"
      >
        <img src={logo} alt="دار الجود" className="h-5 w-auto" />
        <span
          className="font-bold text-white"
          style={{ fontFamily: "'Scheherazade New', serif" }}
        >
          دار الجود
        </span>
      </Link>

      {/* النص في المنتصف */}
      <span
        className="hidden md:block font-medium mr-28 text-white"
        style={{ fontFamily: "'Scheherazade New', serif" }}
      >
        في دار الجود، أنت المصمم – اختر، غيّر، أبدع.
      </span>

      {/* رقم الواتساب */}
      <button
        onClick={handleWhatsAppClick}
        className="flex items-center gap-1 hover:bg-white/10 px-2 py-1 rounded transition-colors duration-200"
      >
        <MessageCircle className="w-3 h-3" />
        <span className="font-medium">0536065766</span>
      </button>
    </div>
  );
};

export default TopBar;
