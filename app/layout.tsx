import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CharFaces - Kitap Karakterlerini Görselleştir",
  description: "Hayal ettiğin kitap karakterlerini AI ile üret, topluluğunla paylaş.",
};

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