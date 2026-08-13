export default function AuthShell({ label, children }) {
  return (
    <main className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden bg-footer px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-8 right-8 size-28 rotate-12 rounded-[2rem] bg-yellow opacity-90 sm:right-[12%]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-4 size-36 rounded-full bg-green opacity-80 sm:left-[10%]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-8 left-20 size-24 rounded-full bg-blue opacity-90 sm:left-[16%]"
      />

      <div className="relative z-10 w-full max-w-[440px]">
        {label ? (
          <p className="mb-3 text-body-3 font-medium text-white/80">{label}</p>
        ) : null}
        <div className="card border-0 p-8 shadow-dropdown sm:p-10">{children}</div>
      </div>
    </main>
  );
}
