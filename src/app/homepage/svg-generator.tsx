import GeneratorPrompt from "./generator/generator-prompt";

export default function SvgGenerator() {
  return (
    <div className="bg-primary/10 rounded-[36px] p-[8px]">
      <div className="from-card/70 to-secondary/50 w-full rounded-[28px] border border-white/50 bg-gradient-to-b text-neutral-500 dark:border-neutral-700/50">
        <div className="px-6 py-4">
          <GeneratorPrompt />
        </div>
      </div>
    </div>
  );
}
