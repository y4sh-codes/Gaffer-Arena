"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trophy,
  Shield,
  Users,
  Sun,
  Moon,
  LogIn,
  LogOut,
  ChevronDown,
  User as UserIcon,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [isDark, setIsDark] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Read persisted theme on mount
    const stored = localStorage.getItem("gaffer_theme");
    const isLightMode = stored === "light" || document.documentElement.classList.contains("light");
    setIsDark(!isLightMode);
  }, []);

  useEffect(() => {
    // Close dropdown on outside click
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("gaffer_theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      localStorage.setItem("gaffer_theme", "dark");
      setIsDark(true);
    }
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Shield },
    { href: "/leagues/create", label: "Create League", icon: Trophy },
    { href: "/leagues/join", label: "Join League", icon: Users },
  ];

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0]?.toUpperCase() || "")
        .slice(0, 2)
        .join("") || "GA"
    : "GA";

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-subtle px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
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
            <div className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold -mt-1">
              EA Sports FC Draft Platform
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-surface border border-subtle rounded-full px-3 py-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-arena-neonGreen text-slate-950 shadow-neon font-black"
                    : "text-muted hover:text-foreground hover:bg-subtle"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Theme Switcher & Authentication */}
        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle light and dark theme"
            className="p-2.5 rounded-xl bg-surface border border-subtle hover:border-emerald-500/50 text-foreground transition flex items-center justify-center"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-600" />
            )}
          </button>

          {/* User Auth Section */}
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-subtle animate-pulse" />
          ) : user ? (
            /* Signed In User Menu */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-2 border-l border-subtle group focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 p-[1.5px] shadow-sm">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "Manager"}
                      className="w-full h-full rounded-full object-cover bg-slate-900"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white">
                      {initials}
                    </div>
                  )}
                </div>

                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-foreground leading-tight flex items-center gap-1">
                    {user.name || "Gaffer"}
                    <ChevronDown className="w-3 h-3 text-muted group-hover:text-foreground transition" />
                  </div>
                  <div className="text-[10px] text-emerald-500 font-mono font-semibold">
                    Manager Active
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel border border-subtle shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3 border-b border-subtle mb-1">
                    <div className="font-extrabold text-xs text-foreground truncate">
                      {user.name || "Manager"}
                    </div>
                    <div className="text-[10px] text-muted font-mono truncate mt-0.5">
                      {user.email}
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 w-full p-2.5 rounded-xl text-xs font-bold text-foreground hover:bg-subtle transition"
                  >
                    <Shield className="w-4 h-4 text-cyan-400" />
                    Manager Dashboard
                  </Link>

                  <Link
                    href="/leagues/create"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 w-full p-2.5 rounded-xl text-xs font-bold text-foreground hover:bg-subtle transition"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    Create League
                  </Link>

                  <div className="border-t border-subtle my-1"></div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex items-center gap-2 w-full p-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Signed Out: Sign In Button */
            <div className="flex items-center gap-2 pl-2 border-l border-subtle">
              <Link
                href="/auth/signin"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-arena-neonGreen text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon hover:scale-105 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
