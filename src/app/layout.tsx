import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gaffer Arena | FIFA-Style Multiplayer Manager & Auction Draft",
  description:
    "Real-time multiplayer football manager, 20-second live auction draft, tactics board, and match simulation platform powered by real FIFA & EA Sports FC datasets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-arena-dark min-h-screen text-slate-100 flex flex-col selection:bg-arena-neonGreen selection:text-black">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/5 py-6 px-4 text-center text-xs text-slate-500">
          <p>© 2026 Gaffer Arena — FIFA & EA Sports FC Tactical Manager Engine.</p>
        </footer>
      </body>
    </html>
  );
}
