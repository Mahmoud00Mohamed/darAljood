import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SubSidebarSectionProps {
  title: string;
  children: React.ReactNode;
  isDefaultOpen?: boolean;
}

const SubSidebarSection: React.FC<SubSidebarSectionProps> = ({
  title,
  children,
  isDefaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(isDefaultOpen);

  return (
    <div className="mb-4 rounded-xl border border-gray-200 overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 text-sm font-medium text-gray-800 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-semibold text-[#563660]">{title}</span>
        {isOpen ? (
          <ChevronUp size={16} className="text-gray-600" />
        ) : (
          <ChevronDown size={16} className="text-gray-600" />
        )}
      </button>
      {isOpen && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
};

export default SubSidebarSection;
