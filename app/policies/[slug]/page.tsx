import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPolicies, type ShopifyPolicy } from '@/lib/shopify';
import { BackButton } from '@/components/ui/back-button';

const policyMap = {
  privacy: 'privacyPolicy',
  terms: 'termsOfService',
  shipping: 'shippingPolicy',
  refunds: 'refundPolicy',
  refund: 'refundPolicy',
  legal: 'legalNotice',
  contact: 'contactInformation',
} as const;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const key = policyMap[slug as keyof typeof policyMap];
  if (!key) return { title: 'Policy Not Found | UNDRSKIN' };
  const policies = await getPolicies();
  const policy = policies[key];
  return {
    title: `${policy?.title || 'Policy'} | UNDRSKIN`,
    description: `Official ${policy?.title || 'policy'} for UNDRSKIN.`,
  };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const key = policyMap[slug as keyof typeof policyMap];
  if (!key) notFound();
  const policy = (await getPolicies())[key] as ShopifyPolicy | null;

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-20">
      <div className="mb-6 pb-2 border-b border-neutral-900/60 flex items-center justify-between">
        <BackButton label="Back to Home" fallbackUrl="/" />
      </div>
      <div className="border-b border-black/10 pb-6">
        <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">UNDRSKIN Legal</span>
        <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-5xl">{policy?.title || 'Policy not available'}</h1>
      </div>
      {policy ? (
        <article
          className="prose prose-neutral mt-10 max-w-none text-[15px] leading-relaxed text-neutral-700 prose-headings:font-serif prose-headings:font-normal prose-headings:text-black prose-a:text-black prose-a:underline hover:prose-a:opacity-70 prose-strong:text-black"
          dangerouslySetInnerHTML={{ __html: policy.body }}
        />
      ) : (
        <p className="mt-8 text-neutral-600">This policy has not been configured in Shopify yet.</p>
      )}
    </main>
  );
}
