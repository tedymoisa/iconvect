import { BlurIn } from "./blur-in";
import SvgPreview from "./generator/svg-preview";
import { Heading } from "./heading";
import SvgGenerator from "./svg-generator";

export default function HomePage() {
  return (
    <div className="size-full bg-[url(/svg/ellipsis-dark.svg)] bg-[length:30px_30px] bg-repeat dark:bg-[url(/svg/ellipsis-light.svg)]">
      <div
        className={
          "size-full bg-gradient-to-tr from-zinc-50/90 via-zinc-50/40 to-zinc-50/10 dark:from-zinc-950/90 dark:via-zinc-950/40 dark:to-zinc-950/10"
        }
      >
        <main className="mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
          <BlurIn>
            <div className={"bg-secondary mx-auto w-fit rounded-xl border p-1 px-3 text-sm"}>Release v1.0.0</div>
            <div className="mt-5 flex max-w-3xl flex-col items-center">
              <Heading text="Your Projects, Your Icons" />
              <p className="text-muted-foreground md:text-l mt-5 text-center text-base sm:text-lg">
                Generate stunning, unique vector icons instantly using the power of Al. Create scalable SVG assets for
                your projects in seconds.
              </p>
              <div className="mt-12 w-full">
                <p className="text-muted-foreground mb-4 text-center text-base font-semibold sm:text-lg md:text-xl">
                  What do you want to create?
                </p>
                <SvgGenerator />
                <SvgPreview />
              </div>
            </div>
          </BlurIn>
        </main>
      </div>
    </div>
  );
}
