import Link from 'next/link';
import { getFAQs } from '@/lib/shopify';

export const metadata = {
  title: 'Client Services & FAQ — UNDRSKIN',
  description: 'Frequently asked questions regarding sizing, silk care, international delivery, and discreet returns.',
};

export default async function FAQPage() {
  const faqs = await getFAQs();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
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

      <div className="space-y-4">
        {faqs.map((faq) => (
          <details
            key={faq.id}
            className="group bg-neutral-900/30 border border-neutral-800/80 p-6 transition-all duration-300 open:border-neutral-700"
          >
            <summary className="flex items-center justify-between cursor-pointer list-none text-xs uppercase tracking-widest text-neutral-200 group-hover:text-white select-none">
              <span className="pr-6 leading-relaxed font-normal">{faq.question}</span>
              <span className="text-neutral-500 group-hover:text-white transition-transform duration-300 group-open:rotate-45 font-mono text-base flex-shrink-0">
                +
              </span>
            </summary>
            <p className="mt-4 text-xs font-light text-neutral-400 leading-relaxed pt-4 border-t border-neutral-800/60">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>

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
