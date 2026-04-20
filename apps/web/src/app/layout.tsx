import type { Metadata } from "next";
import { DM_Sans, DM_Mono, Syne } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Antigravity — The Operating System for Fleets", template: "%s | Antigravity" },
  description: "Real-time fleet P&L, driver settlements, and compliance management for modern travel operators.",
  keywords: ["fleet management", "P&L tracking", "driver settlement", "Indian travel SaaS", "transport management"],
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: "https://antigravity.travel",
    siteName: "Antigravity",
    images: [{ url: "/logo.png", width: 800, height: 600, alt: "Antigravity Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Antigravity — Defy Flight Constraints",
    description: "Manage your fleet's financial health with precision.",
    images: ["/logo.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable} ${syne.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storage = localStorage.getItem('antigravity-ui');
                  if (storage) {
                    const theme = JSON.parse(storage).state.theme;
                    if (theme === 'light') document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster
            richColors
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--bg-elevated)",
                border: "1px solid var(--bg-border)",
                color: "var(--text-main)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
