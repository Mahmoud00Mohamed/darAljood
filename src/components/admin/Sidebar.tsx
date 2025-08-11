import React from "react";
import {
  Settings,
  LogOut,
  Home,
  DollarSign,
  Image as ImageIcon,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  activeTab: "pricing" | "images";
  setActiveTab: (tab: "pricing" | "images") => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  onLogout,
}) => {
  const navigate = useNavigate();

  return (
    <aside
      className={`${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transform fixed md:static inset-y-0 left-0 z-40 w-72 bg-white shadow-2xl border-r border-gray-100 transition-transform duration-300 ease-in-out`}
    >
      <div className="h-full flex flex-col">
        <div className="p-6 bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">لوحة التحكم</h1>
              <p className="text-sm opacity-90">دار الجود</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-6 space-y-2">
          <button
            onClick={() => {
              setActiveTab("pricing");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === "pricing"
                ? "bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white shadow-lg"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span>إدارة الأسعار</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("images");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === "images"
                ? "bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white shadow-lg"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span>الشعارات الجاهزة</span>
          </button>

          <div className="border-t border-gray-200 pt-4 mt-6">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
            >
              <Home className="w-5 h-5" />
              <span>العودة للموقع</span>
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 mt-2"
            >
              <LogOut className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </nav>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="text-center">
            <div className="w-8 h-8 bg-gradient-to-r from-[#563660] to-[#7e4a8c] rounded-lg flex items-center justify-center mx-auto mb-2">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs text-gray-600">النظام يعمل بشكل طبيعي</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
