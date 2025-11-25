import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "QuickConvert - Fast PDF & Image Tools",
  description: "Free online tools to compress, convert, and manipulate PDFs and images. All processing happens in your browser - fast, secure, and private.",
  keywords: ["PDF converter", "image compressor", "PDF to JPG", "JPG to PDF", "image converter", "PDF compression"],
  authors: [{ name: "QuickConvert" }],
  openGraph: {
    title: "QuickConvert - Fast PDF & Image Tools",
    description: "Free online tools to compress, convert, and manipulate PDFs and images.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "QuickConvert",
    "description": "Free online tools to compress, convert, and manipulate PDFs and images.",
    "url": "https://quickconvert.vercel.app",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="antialiased bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
