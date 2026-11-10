import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import AuthProvider from "@/components/providers/AuthProvider";
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('gaffer_theme');
                  if (stored === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col selection:bg-arena-neonGreen selection:text-black">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-subtle py-6 px-4 text-center text-xs text-muted">
            <p>© 2026 Gaffer Arena — FIFA & EA Sports FC Tactical Manager Engine.</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
