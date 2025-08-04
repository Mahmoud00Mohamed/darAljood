import React from "react";
import { motion } from "framer-motion";
import { Filter } from "lucide-react";
import { CategoryFilterProps } from "../types";

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  rtl = true,
  className = "",
}) => {
  return (
    <div className={`flex flex-wrap justify-center gap-4 ${className}`}>
      {categories.map((category) => (
        <motion.button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
            selectedCategory === category
              ? "bg-amber-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-600"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ direction: rtl ? "rtl" : "ltr" }}
        >
          <div
            className={`flex items-center gap-2 ${
              rtl ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>{category}</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
};
