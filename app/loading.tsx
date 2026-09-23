export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-10 h-10 border border-neutral-700 border-t-white rounded-full animate-spin" />
      <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-mono animate-pulse">
        UNDRSKIN Archive Loading
      </span>
    </div>
  );
}
