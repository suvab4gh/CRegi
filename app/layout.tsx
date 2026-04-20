import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CREGI",
  description:
    "A chain-abstracted USDC checkout terminal for Solana payments and Avalanche settlement."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
