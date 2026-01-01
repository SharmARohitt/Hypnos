import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Hypnos | Cognitive Execution Layer for Ethereum",
  description: "A cognitive execution layer that bridges human intent, AI reasoning, and deterministic blockchain execution. Understand what smart contracts actually do.",
  keywords: ["Ethereum", "Smart Contracts", "AI", "Blockchain", "MetaMask", "ERC-7715", "Permissions"],
  authors: [{ name: "Hypnos Team" }],
  openGraph: {
    title: "Hypnos | Cognitive Execution Layer",
    description: "Understand smart contract execution through AI-powered explanations",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" />
            <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow animation-delay-4000" />
          </div>
          {children}
        </Providers>
      </body>
    </html>
  );
}
