import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fishon — Fresh Fish Delivery in East Delhi | Order by 11 PM",
  description: "Fresh fish and seafood home delivery in East Delhi. Rohu, Hilsa, Tiger Prawns, Pomfret and more. Order by 11 PM, delivered next morning 9 AM to 12 PM. Serving Preet Vihar, Mandawali, IP Extension, Mayur Vihar. FSSAI Registered.",
  keywords: "fresh fish delivery east delhi, fish home delivery delhi, rohu fish delivery, hilsa fish delhi, prawns delivery east delhi, seafood delivery preet vihar, fish delivery mandawali, fishon",
  openGraph: {
    title: "Fishon — Fresh Fish Delivery in East Delhi",
    description: "Order fresh fish by 11 PM, delivered next morning 9-12 AM. Rohu, Hilsa, Prawns, Pomfret & more.",
    url: "https://fishon.co.in",
    siteName: "Fishon",
    locale: "en_IN",
    type: "website",
  },
  verification: {
    google: "FS6Ukuseg2NO6LuLLCaH_EWZ_23IWo32esktRYWEco4",
  },
  alternates: {
    canonical: "https://fishon.co.in",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="google-site-verification" content="FS6Ukuseg2NO6LuLLCaH_EWZ_23IWo32esktRYWEco4" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Fishon" />
        <meta property="og:image" content="https://fishon.co.in/og-image.jpg" />
        <link rel="canonical" href="https://fishon.co.in" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
