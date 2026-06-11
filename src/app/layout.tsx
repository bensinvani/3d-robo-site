import type { Metadata } from "next";
import { Quicksand, Inter } from "next/font/google";
import { SmoothScrolling } from "@/components/providers/smooth-scrolling";
import "./globals.css";

const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-quicksand" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "robo — your little companion",
  description:
    "Meet robo: a small robot with a knit hoodie, glowing eyes, and a big heart.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${quicksand.variable} ${inter.variable} grain antialiased`}>
        <SmoothScrolling>{children}</SmoothScrolling>
      </body>
    </html>
  );
}
