import type { Metadata } from 'next';
import { Inter, Space_Mono } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/components/cart/cart-context';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/cart/cart-drawer';
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
  title: 'UNDRSKIN — Second-Skin Luxury Undergarments',
  description:
    'Architectural second-skin foundation pieces, minimalist slips, modal camisoles, and pure silk intimates engineered for absolute comfort and sculpted elegance.',
  keywords: ['luxury lingerie', 'minimalist underwear', 'silk slips', 'modal garments', 'second skin', 'UNDRSKIN'],
  authors: [{ name: 'UNDRSKIN Studio' }],
  metadataBase: new URL('https://undrskin.studio'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://undrskin.studio',
    siteName: 'UNDRSKIN Studio',
    title: 'UNDRSKIN — Second-Skin Luxury Undergarments',
    description: 'Architectural second-skin foundation pieces crafted for absolute comfort and sculpted elegance.',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collections = await getCollections();

  return (
    <html lang="en" className={`${inter.variable} ${spaceMono.variable} dark`}>
      <body className="bg-[#0c0c0c] text-neutral-100 font-sans antialiased min-h-screen flex flex-col selection:bg-neutral-200 selection:text-black">
        <CartProvider>
          <AnnouncementBar />
          <Header collections={collections} />
          <main className="flex-1 w-full">{children}</main>
          <Footer collections={collections} />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
