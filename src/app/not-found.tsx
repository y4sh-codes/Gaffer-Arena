import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center max-w-md border border-white/10 shadow-glass">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-2">404</h1>
        <h2 className="text-lg font-bold uppercase text-slate-200 mb-2">Offside! Pitch Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">
          The tactical page or match room you are looking for has been moved or does not exist.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-arena-neonGreen text-slate-950 font-bold uppercase text-xs tracking-wider shadow-neon hover:opacity-90 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
