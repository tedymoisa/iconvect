import Logo from "@/components/logo";
import SvgPreview from "./generator/svg-preview";
import SvgGenerator from "./svg-generator";

export default function HomePage() {
  return (
    <main className="relative mx-auto max-w-5xl px-4 pb-20 pt-16 md:pb-24 md:pt-20">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex h-full justify-center overflow-hidden opacity-30 blur-3xl" // <-- Add h-screen and pointer-events-none
      >
        <svg viewBox="0 0 1024 1024" className="h-[64rem] w-[64rem] flex-none">
          <defs>
            <radialGradient id="radial-gradient-header" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="hsl(var(--primary) / 0.4)" />
              <stop offset="100%" stopColor="hsl(var(--primary) / 0)" />
            </radialGradient>
          </defs>
          <rect width="1024" height="1024" fill="url(#radial-gradient-header)"></rect>
        </svg>
      </div>
      <header className="relative z-10 mb-20 text-center md:mb-24">
        <div className="mb-6 inline-flex flex-col items-center gap-y-3 md:mb-8 md:flex-row md:gap-x-4">
          <Logo className="h-10 w-auto shrink-0 text-purple-400 md:h-12" />

          <h1 className="bg-gradient-to-br from-purple-400 to-purple-600 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent md:text-6xl lg:text-7xl">
            Vectricon
          </h1>
        </div>

        <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          Transform your ideas into beautiful vector graphics with the power of AI. Leverage cutting-edge models to
          generate unique, scalable artwork instantly.
        </p>
      </header>
      <SvgGenerator />
      <SvgPreview />
    </main>
  );
}
