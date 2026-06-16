import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { CartProvider } from "@/context/cart-context";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { WhatsAppButton } from "@/components/whatsapp-button";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://brew-and-bite.example"),
  title: {
    default: "Brew & Bite Cafe | Online Food Ordering",
    template: "%s | Brew & Bite Cafe",
  },
  description:
    "Order handcrafted coffee, fresh cafe plates, desserts, and reserve tables online at Brew & Bite Cafe.",
  keywords: ["cafe", "online food ordering", "coffee", "restaurant", "reservation"],
  openGraph: {
    title: "Brew & Bite Cafe",
    description: "Premium cafe ordering, pickup, delivery, and table reservations.",
    images: ["/og-cafe.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <SiteHeader />
              <main>{children}</main>
              <SiteFooter />
              <WhatsAppButton />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
