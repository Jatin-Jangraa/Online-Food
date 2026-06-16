export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="h-10 w-64 animate-pulse rounded-full bg-line" />
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-80 animate-pulse rounded-[2rem] bg-line" />)}
      </div>
    </div>
  );
}
