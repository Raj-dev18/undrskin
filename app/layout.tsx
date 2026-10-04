import type { Metadata } from 'next';
import { Inter, Space_Mono } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/components/cart/cart-context';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { CheckoutModal } from '@/components/checkout/checkout-modal';
import { getCollections } from '@/lib/shopify';

export const dynamic = 'force-dynamic';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'UndrSkin — Bamboo Essentials',
  description:
    'Skin-first comfort with luxuriously soft bamboo essentials designed for everyday movement.',
  keywords: ['luxury lingerie', 'minimalist underwear', 'silk slips', 'modal garments', 'second skin', 'UNDRSKIN'],
  authors: [{ name: 'UNDRSKIN Studio' }],
  metadataBase: new URL('https://undrskin.in'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://undrskin.in',
    siteName: 'UndrSkin',
    title: 'UndrSkin — Bamboo Essentials',
    description: 'Skin-first comfort with luxuriously soft bamboo essentials designed for everyday movement.',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collections = await getCollections();

  return (
    <html lang="en" className={`${inter.variable} ${spaceMono.variable}`}>
      <body className="bg-[#A6C7B7] text-[#302824] font-sans antialiased min-h-screen flex flex-col selection:bg-[#B96F73] selection:text-white">
        <CartProvider>
          <AnnouncementBar />
          <Header collections={collections} />
          <main className="flex-1 w-full">{children}</main>
          <Footer collections={collections} />
          <CartDrawer />
          <CheckoutModal />
        </CartProvider>
      </body>
    </html>
  );
}
