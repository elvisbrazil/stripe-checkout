import type { Metadata } from "next";
import { Header } from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paper & Brass",
  description: "A small store paying through Stripe Checkout",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
