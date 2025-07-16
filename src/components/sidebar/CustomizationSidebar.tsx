import React, { useState, useEffect, useRef } from "react";
import ColorSection from "./sections/ColorSection";
import MaterialSection from "./sections/MaterialSection";
import SizeSection from "./sections/SizeSection";
import FrontLogoSection from "./sections/FrontLogoSection";
import BackLogoSection from "./sections/BackLogoSection";
import RightLogoSection from "./sections/RightLogoSection";
import LeftLogoSection from "./sections/LeftLogoSection";
import FrontTextSection from "./sections/FrontTextSection";
import BackTextSection from "./sections/BackTextSection";
import SubSidebarSection from "./sections/SubSidebarSection";
import { Palette, Layers, ImagePlus, RotateCw, Ruler } from "lucide-react";
import { useJacket, JacketView } from "../../context/JacketContext";
import Logo10 from "/logos/logo10.png";

interface CustomizationSidebarProps {
  isMobile?: boolean;
  setIsSidebarOpen?: (isOpen: boolean) => void;
}

const CustomizationSidebar: React.FC<CustomizationSidebarProps> = ({
  isMobile,
  setIsSidebarOpen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [activeView, setActiveView] = useState<JacketView>("front");
  const [activeContent, setActiveContent] = useState<"logos" | "texts">(
    "logos"
  );
  const { setCurrentView } = useJacket();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [lastVisited, setLastVisited] = useState<{
    section: string;
    view: JacketView;
    content?: "logos" | "texts";
  }>({
    section: "",
    view: "front",
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1250) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if ((isMobile || window.innerWidth <= 1250) && setIsSidebarOpen) {
      setIsSidebarOpen(isOpen);
    }
  }, [isMobile, isOpen, setIsSidebarOpen]);

  useEffect(() => {
    if ((isMobile || window.innerWidth <= 1250) && isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          sidebarRef.current &&
          !sidebarRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setLastVisited({
            section: activeSection,
            view: activeView,
            content: activeContent,
          });
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isMobile, isOpen, activeSection, activeView, activeContent]);

  const handleSectionClick = (section: string) => {
    if (
      (isMobile || window.innerWidth <= 1250) &&
      section === activeSection &&
      isOpen
    ) {
      setIsOpen(false);
      setLastVisited({
        section: activeSection,
        view: activeView,
        content: activeContent,
      });
    } else {
      setActiveSection(section);
      setIsOpen(true);
      if (section === lastVisited.section && lastVisited.view) {
        setActiveView(lastVisited.view);
        setCurrentView(lastVisited.view);
        setActiveContent(lastVisited.content || "logos");
      } else if (section === "extras") {
        setActiveView("front");
        setCurrentView("front");
        setActiveContent("logos");
      }
    }
  };

  const handleViewClick = (view: JacketView) => {
    setActiveView(view);
    setCurrentView(view);
    if (view === "right" || view === "left") {
      setActiveContent("logos");
    }
    setLastVisited({ section: activeSection, view, content: activeContent });
  };

  const handleContentChange = (content: "logos" | "texts") => {
    setActiveContent(content);
    setLastVisited({ section: activeSection, view: activeView, content });
  };

  const handleRotate = () => {
    const views: JacketView[] =
      activeSection === "extras" && activeContent === "texts"
        ? ["front", "back"]
        : ["front", "back", "right", "left"];
    const currentIndex = views.indexOf(activeView);
    const nextIndex = (currentIndex + 1) % views.length;
    setActiveView(views[nextIndex]);
    setCurrentView(views[nextIndex]);
    if (views[nextIndex] === "right" || views[nextIndex] === "left") {
      setActiveContent("logos");
    }
    setLastVisited({
      section: activeSection,
      view: views[nextIndex],
      content: activeContent,
    });
  };

  const renderViewButtons = () => {
    const views: { id: JacketView; name: string }[] = [
      { id: "front", name: "أمامي" },
      { id: "back", name: "خلفي" },
      { id: "right", name: "يمين" },
      { id: "left", name: "يسار" },
    ];

    return (
      <div className="grid grid-cols-4 gap-2 mb-4">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => handleViewClick(view.id)}
            className={`py-2 px-2 text-xs rounded-xl transition-all ${
              activeView === view.id
                ? "bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {view.name}
          </button>
        ))}
      </div>
    );
  };

  const renderContentButtons = () => (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => handleContentChange("logos")}
        className={`flex-1 py-2 px-4 text-sm rounded-xl transition-all ${
          activeContent === "logos"
            ? "bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white shadow-sm"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        الشعارات
      </button>
      <button
        onClick={() => handleContentChange("texts")}
        className={`flex-1 py-2 px-4 text-sm rounded-xl transition-all ${
          activeContent === "texts"
            ? "bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white shadow-sm"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        النصوص
      </button>
    </div>
  );

  if (isMobile || window.innerWidth <= 1250) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md border-t border-gray-200 z-50 mobile-sidebar">
        {/* Bottom Navigation Bar */}
        <div className="flex justify-around items-center h-16 px-2 bg-white sticky bottom-0 z-60 border-t border-gray-200">
          <button
            onClick={() => handleSectionClick("colors")}
            className={`flex flex-col items-center p-2 ${
              activeSection === "colors" ? "text-[#563660]" : "text-gray-600"
            }`}
          >
            <Palette size={18} />
            <span className="text-xs mt-1">الألوان</span>
          </button>
          <button
            onClick={() => handleSectionClick("materials")}
            className={`flex flex-col items-center p-2 ${
              activeSection === "materials" ? "text-[#563660]" : "text-gray-600"
            }`}
          >
            <Layers size={18} />
            <span className="text-xs mt-1">الخامات</span>
          </button>
          <button
            onClick={() => handleSectionClick("sizes")}
            className={`flex flex-col items-center p-2 ${
              activeSection === "sizes" ? "text-[#563660]" : "text-gray-600"
            }`}
          >
            <Ruler size={18} />
            <span className="text-xs mt-1">المقاسات</span>
          </button>
          <button
            onClick={() => {
              handleSectionClick("extras");
              if (lastVisited.section === "extras") {
                handleViewClick(lastVisited.view);
                setActiveContent(lastVisited.content || "logos");
              } else {
                handleViewClick("front");
                setActiveContent("logos");
              }
            }}
            className={`flex flex-col items-center p-2 ${
              activeSection === "extras" ? "text-[#563660]" : "text-gray-600"
            }`}
          >
            <ImagePlus size={18} />
            <span className="text-xs mt-1">الإضافات</span>
          </button>
          <button
            onClick={handleRotate}
            className="flex flex-col items-center p-2 text-gray-600"
          >
            <RotateCw size={18} />
            <span className="text-xs mt-1">تدوير</span>
          </button>
        </div>

        {/* Expandable Content Area */}
        {isOpen && activeSection && (
          <div
            ref={sidebarRef}
            className="absolute bottom-16 left-0 right-0 bg-white overflow-y-auto p-4 border-t border-gray-200 z-40"
            style={{ height: "40vh", overscrollBehavior: "contain" }}
          >
            {activeSection === "colors" && (
              <SubSidebarSection title="الألوان" isDefaultOpen>
                <ColorSection />
              </SubSidebarSection>
            )}
            {activeSection === "materials" && (
              <SubSidebarSection title="الخامات" isDefaultOpen>
                <MaterialSection />
              </SubSidebarSection>
            )}
            {activeSection === "sizes" && (
              <SubSidebarSection title="المقاسات" isDefaultOpen>
                <SizeSection />
              </SubSidebarSection>
            )}
            {activeSection === "extras" && (
              <SubSidebarSection
                title={`الإضافات - ${
                  activeView === "front"
                    ? "أمامي"
                    : activeView === "back"
                    ? "خلفي"
                    : activeView === "right"
                    ? "يمين"
                    : "يسار"
                }`}
                isDefaultOpen
              >
                {renderViewButtons()}
                {(activeView === "front" || activeView === "back") &&
                  renderContentButtons()}
                {activeView === "front" && (
                  <>
                    {activeContent === "logos" && <FrontLogoSection />}
                    {activeContent === "texts" && <FrontTextSection />}
                  </>
                )}
                {activeView === "back" && (
                  <>
                    {activeContent === "logos" && <BackLogoSection />}
                    {activeContent === "texts" && <BackTextSection />}
                  </>
                )}
                {activeView === "right" && <RightLogoSection />}
                {activeView === "left" && <LeftLogoSection />}
              </SubSidebarSection>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Amiri:wght@700&display=swap"
        rel="stylesheet"
      />
      <div
        className={`h-screen bg-white shadow-xl transition-all duration-300 ${
          isOpen ? "w-[380px]" : "w-[60px]"
        } border-l border-gray-200`}
      >
        <div className="flex h-full">
          <div className="w-[60px] bg-gradient-to-b from-gray-50 to-white flex flex-col items-center py-4 border-r border-gray-100">
            <button
              onClick={() => handleSectionClick("colors")}
              className={`p-3 rounded-xl mb-3 ${
                activeSection === "colors"
                  ? "bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white shadow-sm"
                  : "bg-gray-200 text-gray-600"
              } hover:bg-gray-300 transition-all`}
              title="الألوان"
            >
              <Palette size={18} />
            </button>
            <button
              onClick={() => handleSectionClick("materials")}
              className={`p-3 rounded-xl mb-3 ${
                activeSection === "materials"
                  ? "bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white shadow-sm"
                  : "bg-gray-200 text-gray-600"
              } hover:bg-gray-300 transition-all`}
              title="الخامات"
            >
              <Layers size={18} />
            </button>
            <button
              onClick={() => handleSectionClick("sizes")}
              className={`p-3 rounded-xl mb-3 ${
                activeSection === "sizes"
                  ? "bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white shadow-sm"
                  : "bg-gray-200 text-gray-600"
              } hover:bg-gray-300 transition-all`}
              title="المقاسات"
            >
              <Ruler size={18} />
            </button>
            <button
              onClick={() => {
                handleSectionClick("extras");
                if (lastVisited.section === "extras") {
                  handleViewClick(lastVisited.view);
                  setActiveContent(lastVisited.content || "logos");
                } else {
                  handleViewClick("front");
                  setActiveContent("logos");
                }
              }}
              className={`p-3 rounded-xl mb-3 ${
                activeSection === "extras"
                  ? "bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white shadow-sm"
                  : "bg-gray-200 text-gray-600"
              } hover:bg-gray-300 transition-all`}
              title="الإضافات"
            >
              <ImagePlus size={18} />
            </button>
          </div>

          {isOpen && (
            <div className="flex-1 overflow-y-auto p-6 bg-white h-full">
              {!activeSection && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="mb-24">
                    <img src={Logo10} alt="Logo" className="max-w-full mb-4" />
                    <p className="text-sm font-bold bg-gradient-to-r from-[#7050a0] to-[#563660] text-transparent bg-clip-text">
                      في دار الجود، أنت المصمم – اختر، غيّر، أبدع.
                    </p>
                  </div>
                </div>
              )}
              {activeSection === "colors" && (
                <SubSidebarSection title="تخصيص الجاكيت" isDefaultOpen>
                  <ColorSection />
                </SubSidebarSection>
              )}
              {activeSection === "materials" && (
                <SubSidebarSection title="الخامات" isDefaultOpen>
                  <MaterialSection />
                </SubSidebarSection>
              )}
              {activeSection === "sizes" && (
                <SubSidebarSection title="المقاسات" isDefaultOpen>
                  <SizeSection />
                </SubSidebarSection>
              )}
              {activeSection === "extras" && (
                <SubSidebarSection
                  title={`الإضافات - ${
                    activeView === "front"
                      ? "أمامي"
                      : activeView === "back"
                      ? "خلفي"
                      : activeView === "right"
                      ? "يمين"
                      : "يسار"
                  }`}
                  isDefaultOpen
                >
                  {renderViewButtons()}
                  {(activeView === "front" || activeView === "back") &&
                    renderContentButtons()}
                  {activeView === "front" && (
                    <>
                      {activeContent === "logos" && <FrontLogoSection />}
                      {activeContent === "texts" && <FrontTextSection />}
                    </>
                  )}
                  {activeView === "back" && (
                    <>
                      {activeContent === "logos" && <BackLogoSection />}
                      {activeContent === "texts" && <BackTextSection />}
                    </>
                  )}
                  {activeView === "right" && <RightLogoSection />}
                  {activeView === "left" && <LeftLogoSection />}
                </SubSidebarSection>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomizationSidebar;
