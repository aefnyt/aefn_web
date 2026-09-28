import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ChatbotLoader } from "@/components/chatbot-loader";

/** URL pública del sitio. Necesaria para Open Graph (WhatsApp exige URLs absolutas). */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aefn.vercel.app";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "AEFN - Asociación de Estudiantes de Física y Nanotecnología",
  description: "Sitio web oficial de la Asociación de Estudiantes de Física y Nanotecnología de Yachay Tech.",
  keywords: ["AEFN", "Yachay Tech", "Física", "Nanotecnología", "Asociación de Estudiantes"],
  authors: [{ name: "AEFN" }],
  icons: {
    icon: [{ url: "/images/logos/ecfn-symbol.png", type: "image/png", sizes: "625x625" }],
    apple: [{ url: "/images/logos/ecfn-symbol.png" }],
  },
  openGraph: {
    title: "AEFN - Asociación de Estudiantes de Física y Nanotecnología",
    description: "Sitio web oficial de la AEFN - Yachay Tech",
    url: "/",
    siteName: "AEFN",
    type: "website",
    images: [{ url: "/images/logos/ecfn-symbol.png", width: 625, height: 625, alt: "Símbolo de la ECFN - AEFN" }],
  },
  twitter: {
    card: "summary",
    title: "AEFN - Yachay Tech",
    description: "Asociación de Estudiantes de Física y Nanotecnología",
    images: ["/images/logos/ecfn-symbol.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-right" richColors closeButton />
        <ChatbotLoader />
      </body>
    </html>
  );
}
