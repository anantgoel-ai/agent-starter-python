import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Insights Curry | AI Voice Assistant",
  description: "Conversational AI Voice Agent powered by Insights Curry — Simplifying Decision",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
