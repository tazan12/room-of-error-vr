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
  title: "경민대학교 통합시뮬레이션수업 | Room of Error",
  description:
    "경민대학교 간호학과 통합시뮬레이션수업을 위한 클릭형 2.5D Room of Error 환자안전 학습 환경",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/assets/kyungmin-university-logo-transparent.png",
    shortcut: "/assets/kyungmin-university-logo-transparent.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
