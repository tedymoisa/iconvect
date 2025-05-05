import { BlurIn } from "./blur-in";
import SvgPreview from "./generator/svg-preview";
import { Heading } from "./heading";
import SvgGenerator from "./svg-generator";

export default function HomePage() {
  return (
    <Background>
      <main className="flex min-h-[calc(100vh-4rem-5rem)] flex-col justify-center px-4">
        <BlurIn>
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <div className={"bg-secondary mx-auto mb-5 w-fit rounded-xl border p-1 px-3 text-sm"}>Release v1.0.0</div>
              <Heading text="Your Projects, Your Icons" />
              <h2 className="text-muted-foreground text-md mt-5 mb-10">
                Create scalable Icons for your projects in seconds. Generate stunning, unique vector icons instantly
                using the power of AI
              </h2>
              <p className="text-muted-foreground mb-4 font-semibold sm:text-lg md:text-xl">
                What do you want to create?
              </p>
            </div>
            <SvgGenerator />
            <SvgPreview />
          </div>
        </BlurIn>
      </main>
    </Background>
  );
}

const Background = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="size-full bg-[url(/svg/ellipsis-dark.svg)] bg-[length:30px_30px] bg-repeat dark:bg-[url(/svg/ellipsis-light.svg)]">
      <div
        className={
          "size-full bg-gradient-to-tr from-zinc-50/90 via-zinc-50/40 to-zinc-50/10 dark:from-zinc-950/90 dark:via-zinc-950/40 dark:to-zinc-950/10"
        }
      >
        {children}
      </div>
    </div>
  );
};
