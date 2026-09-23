export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-4 max-w-sm mb-12">
        <div className="h-4 bg-neutral-900 w-1/3 animate-pulse" />
        <div className="h-8 bg-neutral-900 w-3/4 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse space-y-3">
            <div className="w-full aspect-[3/4] bg-neutral-900" />
            <div className="h-3 bg-neutral-900 w-3/4" />
            <div className="h-3 bg-neutral-900 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
