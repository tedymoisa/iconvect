import Logo from "@/components/logo";
import SvgPreview from "./generator/svg-preview";
import SvgGenerator from "./svg-generator";

export default function HomePage() {
  return (
    <main className="relative mx-auto max-w-5xl px-4 py-20 md:py-20">
      {" "}
      <header className="mb-20 md:mb-24">
        {" "}
        <div className="mb-6 flex flex-col items-start gap-y-3 md:flex-row md:items-center md:gap-x-4">
          <Logo className="h-10 w-auto shrink-0 text-primary dark:text-secondary md:h-12" />
          <h1 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-5xl font-extrabold tracking-tighter text-transparent md:text-6xl lg:text-7xl">
            Vectricon
          </h1>
        </div>
        <p className="max-w-3xl text-lg text-foreground-muted dark:text-foreground-muted_dark md:text-xl">
          Transform your ideas into beautiful vector graphics with the power of AI. Leverage cutting-edge models to
          generate unique, scalable artwork instantly.
        </p>
      </header>
      <SvgGenerator />
      <SvgPreview />
    </main>
  );
}
