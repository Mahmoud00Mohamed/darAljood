import React from "react";
import { motion } from "framer-motion";
import type { LogoPlaceholderProps } from "../types";

const LogoPlaceholder: React.FC<LogoPlaceholderProps> = ({
  size = 40,
  className = "",
  animate = true,
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className="relative"
        animate={
          animate
            ? {
                scale: [1, 1.05, 1],
                opacity: [0.6, 1, 0.6],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-purple-500"
        >
          {/* رمز حمامة/طائر بسيط كـ placeholder */}
          <path
            d="M16 4C12 4 8 6 8 10C8 12 9 14 11 15L10 18C10 20 12 22 16 22C20 22 22 20 22 18L21 15C23 14 24 12 24 10C24 6 20 4 16 4Z"
            fill="currentColor"
            fillOpacity="0.3"
          />
          <circle cx="16" cy="16" r="2" fill="currentColor" fillOpacity="0.6" />
          <path
            d="M12 12C12 13 13 14 14 14C15 14 16 13 16 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
        </svg>

        {/* تأثير توهج خفيف */}
        <div
          className="absolute inset-0 rounded-full bg-purple-500/10 blur-sm"
          style={{ width: size, height: size }}
        />
      </motion.div>
    </div>
  );
};

export default LogoPlaceholder;