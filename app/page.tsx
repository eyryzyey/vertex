import React from "react";

export const metadata = {
  title: "NOVA MEDIA - منصة البث المتميز",
  description: "منصة البث المباشر والأفلام والمسلسلات",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#07080D] text-[#F8FAFC] antialiased">
        {children}
      </body>
    </html>
  );
}
