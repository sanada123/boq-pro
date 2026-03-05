import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Building2, FolderOpen, Plus, Menu, X, Settings2 } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { page: "Home", icon: Plus, label: "פרויקט חדש" },
    { page: "Projects", icon: FolderOpen, label: "פרויקטים" },
    { page: "Settings", icon: Settings2, label: "הגדרות" },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link to={createPageUrl("Home")} className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900">
                  BOQ Pro
                </h1>
                <p className="text-[10px] text-slate-400 -mt-0.5">כתב כמויות חכם</p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm rounded-lg transition-all ${
                    currentPageName === item.page
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="sm:hidden pb-3 border-t border-slate-100 pt-2 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                    currentPageName === item.page
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-500"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5 sm:py-8">
        {children}
      </main>
    </div>
  );
}