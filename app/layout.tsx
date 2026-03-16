import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CharFaces - Kitap Karakterlerini Görselleştir",
  description: "Hayal ettiğin kitap karakterlerini AI ile görselleştir, topluluğunla paylaş. Kitap okurlarının buluşma noktası.",
  keywords: ["kitap karakterleri", "AI görsel", "kitap okurları", "karakter tasarımı", "charfaces"],
  authors: [{ name: "CharFaces" }],
  creator: "CharFaces",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://charface-ten.vercel.app",
    siteName: "CharFaces",
    title: "CharFaces - Kitap Karakterlerini Görselleştir",
    description: "Hayal ettiğin kitap karakterlerini AI ile görselleştir, topluluğunla paylaş.",
    images: [
      {
        url: "https://charface-ten.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "CharFaces",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CharFaces - Kitap Karakterlerini Görselleştir",
    description: "Hayal ettiğin kitap karakterlerini AI ile görselleştir, topluluğunla paylaş.",
    images: ["https://charface-ten.vercel.app/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body style={{margin:0, padding:0, background:'#0a0a0f'}}>
        {children}
      </body>
    </html>
  );
}