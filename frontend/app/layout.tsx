import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FlameSafe AI | Microgravity Combustion Intelligence",
  description:
    "AI-powered scientific intelligence platform transforming NASA Physical Sciences Informatics (PSI) research and microgravity combustion data into structured, searchable, explainable evidence. 2026 NASA Space Apps Challenge (Team R²).",
  icons: {
    icon: [
      { url: "/brand/favicon/favicon.ico" },
      { url: "/brand/favicon/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/brand/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

const THEME_INIT_SCRIPT = `
(function() {
  try {
    var saved = localStorage.getItem('flamesafe-black-lab-theme');
    var mode = (saved === 'light' || saved === 'dark' || saved === 'system') ? saved : 'dark';
    var resolved = mode === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://flamesafe-backend.onrender.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://flamesafe-backend.onrender.com" />
        <link
          rel="preload"
          as="image"
          href="/images/story/hero-mascot-earth.webp"
          type="image/webp"
          media="(min-width: 1024px)"
        />
        <link
          rel="preload"
          as="image"
          href="/images/story/hero-mascot-mobile.webp"
          type="image/webp"
          media="(max-width: 1023px)"
        />
      </head>
      <body className="min-h-screen font-sans antialiased bg-[#080A0F] text-[#F7F7F5] selection:bg-[#FF6B24]/25 selection:text-white">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
