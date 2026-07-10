import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "머니로그",
  description: "문장으로 적는 미니멀 가계부",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col bg-white">
        <Header />
        <AuthGuard>
          <div className="flex flex-1 flex-col">{children}</div>
        </AuthGuard>
      </body>
    </html>
  );
}
