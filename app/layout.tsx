import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://voz.app';

export const metadata: Metadata = {
  title: {
    default: 'Voz. — Voice-first cross-chain payments',
    template: '%s · Voz.',
  },
  description: 'Speak to send USDC from any EVM chain to Solana. Your family hears your voice in their language.',
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: 'website',
    siteName: 'Voz.',
    title: 'Voz. — Speak. Send. Heard.',
    description: 'Voice-first cross-chain remittance. Any EVM chain to Solana, in your language.',
    images: [{ url: '/og.png', width: 1200, height: 628, alt: 'Voz. — Speak. Send. Heard.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Voz. — Speak. Send. Heard.',
    description: 'Voice-first cross-chain remittance. Any EVM chain to Solana, in your language.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
