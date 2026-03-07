import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Building2, FolderOpen, Plus, Menu, X, Settings2, Hexagon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children, currentPageName }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { page: "Home", icon: Plus, label: "פרויקט חדש" },
    { page: "Projects", icon: FolderOpen, label: "פרויקטים" },
    { page: "Settings", icon: Settings2, label: "הגדרות" },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-[#0a0f1a] eng-grid-bg">
      {/* Top Navigation Bar */}
      <header className="eng-header-bar sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 bg-amber-500/20 rounded-lg blur-md group-hover:bg-amber-500/30 transition-all" />
                <div className="relative w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Hexagon className="w-5 h-5 text-[#0a0f1a]" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  BOQ<span className="text-amber-400">Pro</span>
                </h1>
                <p className="text-[10px] text-slate-500 -mt-0.5 tracking-wide" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  QUANTITY TAKEOFF
                </p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-1">
              {navItems.map(item => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={`relative flex items-center gap-2 px-4 py-2 text-sm rounded transition-all ${
                      isActive
                        ? "text-amber-400 font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 bg-amber-500/10 border border-amber-500/20 rounded"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                      />
                    )}
                    <item.icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-2 rounded text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Amber accent line under header */}
          <div className="h-px bg-gradient-to-l from-transparent via-amber-500/30 to-transparent" />
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden overflow-hidden bg-[#0d1320] border-t border-[#1e293b]"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map(item => (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all ${
                      currentPageName === item.page
                        ? "bg-amber-500/10 text-amber-400 font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        {children}
      </main>
    </div>
  );
}
