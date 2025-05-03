import Prompt from "./generator/prompt";

export default function SvgGenerator() {
  return (
    <PromptWrapper>
      <Prompt />
    </PromptWrapper>
  );
}

const PromptWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-primary/10 rounded-[36px] p-[8px]">
      <div className="from-card/70 to-secondary/50 w-full rounded-[28px] border border-white/50 bg-gradient-to-b dark:border-neutral-700/50">
        <div className="py-4 pr-4 pl-3">{children}</div>
      </div>
    </div>
  );
};
