import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PageAnimate from "@/components/PageAnimate";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aura Asistan",
  description: "Zarif ve Modern Kişisel Asistan",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Aura Asistan",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" translate="no" suppressHydrationWarning>
      <head>
        {/* 
          Standard inline script with suppressHydrationWarning is more compatible 
          with React 19/Turbopack for simple flicker-prevention logic. 
        */}
        <script
          id="theme-switcher"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'system';
                const root = document.documentElement;
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  root.setAttribute('data-theme', 'dark');
                } else {
                  root.setAttribute('data-theme', 'light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} no-scrollbar antialiased transition-all duration-300`}>
        <ThemeProvider>
          <div className="relative min-h-screen">
            <PageAnimate>{children}</PageAnimate>
          </div>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
