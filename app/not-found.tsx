import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20 space-y-6">
      <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-mono">
        404 — Void
      </span>
      <h1 className="text-2xl sm:text-3xl font-light text-white tracking-widest uppercase">
        Product Not Found
      </h1>
      <p className="text-xs text-neutral-400 font-light max-w-md leading-relaxed">
        The piece or archive you are searching for is unavailable, relocated, or has been archived from the seasonal curation.
      </p>
      <div className="pt-4 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="px-6 py-3 bg-white text-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-colors"
        >
          Return Home
        </Link>
        <Link
          href="/collections"
          className="px-6 py-3 border border-neutral-700 text-white text-xs uppercase tracking-widest hover:border-white transition-colors"
        >
          Shop the collection
        </Link>
      </div>
    </div>
  );
}
