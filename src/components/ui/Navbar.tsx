"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Shield, Users, Layers, PlaySquare, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const isLightMode = document.documentElement.classList.contains("light");
    setIsDark(!isLightMode);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.add("light");
      setIsDark(false);
    } else {
      document.documentElement.classList.remove("light");
      setIsDark(true);
    }
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Shield },
    { href: "/leagues/create", label: "Create League", icon: Trophy },
    { href: "/leagues/join", label: "Join League", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 p-[2px] shadow-neon">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-black text-xl text-arena-neonGreen tracking-tighter">GA</span>
            </div>
          </div>
          <div>
            <div className="font-extrabold tracking-wider text-lg uppercase bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Gaffer Arena
            </div>
            <div className="text-[10px] uppercase tracking-widest text-emerald-400/80 font-bold -mt-1">
              EA Sports FC Draft Platform
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-arena-neonGreen text-slate-950 shadow-neon"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-400/50 text-slate-300 hover:text-white transition"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-500" />}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 p-[1.5px]">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white">
                PG
              </div>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-200">Pep Gaffer</div>
              <div className="text-[10px] text-emerald-400 font-mono">Rank: Elite I</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
