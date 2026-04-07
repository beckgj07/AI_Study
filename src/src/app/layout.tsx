import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI_Study - 智能学习伙伴",
  description: "小学生全科AI学习辅助系统，智能出题，游戏化闯关、错题讲解",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <head>
        <style>{`
          @font-face {
            font-family: 'KaiTi';
            src: local('KaiTi'), local('楷体'), local('STKaiti');
            font-display: swap;
          }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
