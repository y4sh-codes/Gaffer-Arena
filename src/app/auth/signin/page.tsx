"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Sparkles, User, Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [loading, setLoading] = useState(false);
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  const demoManagers = [
    { name: "Pep Guardiola", email: "pep.guardiola@arena.fc", initials: "PG", club: "Manchester City" },
    { name: "Carlo Ancelotti", email: "carlo.ancelotti@arena.fc", initials: "CA", club: "Real Madrid" },
    { name: "Sir Alex Ferguson", email: "alex.ferguson@arena.fc", initials: "AF", club: "Man United Legend" },
    { name: "José Mourinho", email: "jose.mourinho@arena.fc", initials: "JM", club: "The Special One" },
  ];

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (name: string, email: string) => {
    setLoading(true);
    setSelectedDemo(name);
    try {
      const res = await signIn("demo-login", {
        name,
        email,
        callbackUrl,
        redirect: false,
      });

      if (res?.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setLoading(false);
        setSelectedDemo(null);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
      setSelectedDemo(null);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerName.trim() || !managerEmail.trim()) return;
    await handleDemoSignIn(managerName.trim(), managerEmail.trim());
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-glass">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 p-[2px] shadow-neon mx-auto mb-4 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="font-black text-2xl text-arena-neonGreen tracking-tighter">GA</span>
            </div>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
            Manager Sign In
          </h1>
          <p className="text-xs text-muted mt-1">
            Sign in with Google OAuth or choose an instant Gaffer demo manager profile.
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-surface border border-subtle hover:border-emerald-500/40 text-foreground font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition shadow-sm hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mb-6"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-subtle"></div>
          <span className="flex-shrink mx-3 text-[10px] font-mono uppercase text-muted font-bold tracking-widest">
            OR 1-CLICK DEMO MANAGERS
          </span>
          <div className="flex-grow border-t border-subtle"></div>
        </div>

        {/* 1-Click Preset Managers */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {demoManagers.map((m) => {
            const isSelected = selectedDemo === m.name;
            return (
              <button
                key={m.name}
                type="button"
                onClick={() => handleDemoSignIn(m.name, m.email)}
                disabled={loading}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                  isSelected
                    ? "bg-arena-neonGreen text-slate-950 border-arena-neonGreen shadow-neon font-black"
                    : "bg-surface border-subtle hover:border-emerald-500/40 text-foreground hover:bg-white/5"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                    isSelected ? "bg-slate-950 text-arena-neonGreen" : "bg-emerald-500/20 text-arena-neonGreen"
                  }`}
                >
                  {m.initials}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold truncate leading-tight">{m.name}</div>
                  <div className="text-[9px] opacity-70 truncate">{m.club}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-subtle"></div>
          <span className="flex-shrink mx-3 text-[10px] font-mono uppercase text-muted font-bold tracking-widest">
            CUSTOM MANAGER LOGIN
          </span>
          <div className="flex-grow border-t border-subtle"></div>
        </div>

        {/* Custom Form */}
        <form onSubmit={handleCustomSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-muted font-bold mb-1">
              Your Manager Name
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-3 top-3 text-muted" />
              <input
                type="text"
                required
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="e.g. Zinedine Zidane"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-subtle text-foreground text-xs placeholder-slate-500 focus:outline-none focus:border-arena-neonGreen transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-muted font-bold mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-muted" />
              <input
                type="email"
                required
                value={managerEmail}
                onChange={(e) => setManagerEmail(e.target.value)}
                placeholder="e.g. gaffer@arena.fc"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-subtle text-foreground text-xs placeholder-slate-500 focus:outline-none focus:border-arena-neonGreen transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !managerName || !managerEmail}
            className="w-full mt-2 py-3 rounded-xl bg-arena-neonGreen text-slate-950 font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:opacity-90 transition shadow-neon disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                Sign In as Manager
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-arena-neonGreen animate-spin" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
