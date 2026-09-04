export default function LoadingState() {
  return (
    <section
      className="flex flex-col items-center justify-center gap-4 py-20"
      aria-live="polite"
      aria-label="Loading"
    >
      <div
        className="size-10 animate-spin rounded-full border-4 border-gray-900 border-r-transparent border-b-transparent"
        aria-hidden="true"
      />
      <p className="text-body-2 font-medium text-gray-900">Loading...</p>
    </section>
  );
}
