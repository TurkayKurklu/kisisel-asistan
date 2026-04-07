"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => {}}
      className="relative w-10 h-10 rounded-full glass-panel flex items-center justify-center transition-all bg-white/5 border-white/10 hover:border-primary/50 overflow-hidden"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "dark" ? (
          <motion.div
            key="moon"
            initial={{ y: 20, opacity: 0, rotate: 45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: -45 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="text-primary"
          >
            <Moon size={20} fill="currentColor" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: 20, opacity: 0, rotate: 45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: -45 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="text-amber-500"
          >
            <Sun size={20} fill="currentColor" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Internal Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
    </button>
  );
}
