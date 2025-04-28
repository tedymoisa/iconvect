import Navbar from "@/components/navbar";
import "@/styles/globals.css";

import AuthModal from "@/components/auth-dialog";
import Footer from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { JsonLdWebsite } from "@/json-ld-website";
import { siteConfig } from "@/site-config";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import Providers from "./providers";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} OG Image`
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage]
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} h-dvh w-full`} suppressHydrationWarning={true}>
      <head>
        <JsonLdWebsite />
      </head>
      <body className="relative">
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Navbar />
            {children}
            <AuthModal />
            <Footer />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
