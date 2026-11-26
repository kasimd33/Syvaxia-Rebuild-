import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { JetBrains_Mono, Montserrat } from "next/font/google";

import { AdvisorLauncher } from "@/components/advisor/advisor-launcher";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { LeadModalProvider } from "@/components/leads/lead-modal";
import { siteConfig } from "@/lib/constants";

import "./globals.css";

// Font tokens consumed by the Tailwind `font-sans` / `font-display` / `font-mono`
// utilities via the CSS variables declared in tailwind.config.ts.
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Enterprise SAP & Full-Stack Cohort Training, Bengaluru`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "SAP training Bengaluru",
    "SAP ABAP course",
    "SAP FICO course",
    "SAP MM training",
    "SAP EWM training",
    "full stack Java course",
    "S/4HANA training",
    "corporate SAP training",
    "enterprise L&D India",
  ],
  authors: [{ name: siteConfig.legalName }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Enterprise SAP & Full-Stack Cohort Training`,
    description: siteConfig.description,
    images: [
      {
        url: "/logo.png",
        width: 489,
        height: 138,
        alt: "Syvaxia — Where passion meets innovation",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `${siteConfig.name} — Enterprise SAP & Full-Stack Cohort Training`,
    description: siteConfig.description,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#081220" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${jetbrains.variable} flex min-h-screen flex-col font-sans`}
      >
        {/* Browser extensions (Free Download Manager & friends) stamp
            attributes like `fdprocessedid` onto buttons before React
            hydrates, tripping hydration-mismatch warnings. Strip known
            extension attributes before hydration runs. */}
        <Script id="strip-extension-attrs" strategy="beforeInteractive">
          {`
            (function () {
              var attrs = ["fdprocessedid"];
              try {
                document.querySelectorAll("[" + attrs.join("],[") + "]").forEach(function (el) {
                  attrs.forEach(function (name) { el.removeAttribute(name); });
                });
              } catch (e) { /* never block hydration */ }
            })();
          `}
        </Script>
        <LeadModalProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          {/* Floating AI advisor — chat code is lazy-loaded on first open */}
          <AdvisorLauncher />
        </LeadModalProvider>
      </body>
    </html>
  );
}
