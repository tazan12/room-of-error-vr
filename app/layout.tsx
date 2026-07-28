import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "스마트 병실 VR 탐색실",
  description:
    "간호 시뮬레이션을 위한 클릭형 2.5D 병실 탐색 및 환자안전 학습 환경",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
