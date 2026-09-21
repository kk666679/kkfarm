export function Loading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="animate-pulse text-slate-400">{message}</div>
    </div>
  );
}

export default Loading;
