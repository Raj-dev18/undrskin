import Link from 'next/link';
import { Metadata } from 'next';
import { getFAQs } from '@/lib/shopify';
import { ClientFaqAccordion } from '@/components/ui/client-faq-accordion';

export const metadata: Metadata = {
  title: 'Client Services & FAQ — UNDRSKIN',
  description: 'Frequently asked questions regarding sizing, silk care, international delivery, and discreet returns.',
};

export default async function FAQPage() {
  const faqs = await getFAQs();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-500 mb-8">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-white">Assistance & FAQ</span>
      </nav>

      <div className="text-center max-w-xl mx-auto mb-16">
        <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-mono">
          Assistance & Concierge
        </span>
        <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight uppercase mt-3">
          Frequently Asked Questions
        </h1>
        <p className="text-xs text-neutral-400 font-light mt-4 leading-relaxed">
          Everything you need to know about our material innovations, garment longevity, discreet dispatch, and seamless returns.
        </p>
      </div>

      {/* Categorized and searchable accordion */}
      <ClientFaqAccordion faqs={faqs} />

      {/* Concierge Contact Box */}
      <div className="mt-20 p-8 border border-neutral-800 bg-neutral-900/20 text-center max-w-xl mx-auto space-y-4">
        <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-mono">
          Need bespoke assistance?
        </span>
        <h3 className="text-sm uppercase tracking-widest text-white font-normal">
          Direct Concierge Contact
        </h3>
        <p className="text-xs text-neutral-400 font-light leading-relaxed">
          Our styling advisors and fitting specialists are available Monday through Friday, 09:00 — 18:00 CET.
        </p>
        <div className="pt-2">
          <Link
            href="mailto:concierge@undrskin.studio"
            className="inline-block px-6 py-2.5 text-[11px] tracking-widest uppercase border border-neutral-600 text-white hover:bg-white hover:text-black transition-all"
          >
            Email Concierge
          </Link>
        </div>
      </div>
    </div>
  );
}
