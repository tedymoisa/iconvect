import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={cn(className)}>
      <path
        className="fill-none stroke-primary"
        d="M 4 4 L 10 18 L 16 4 C 16 4 18 6 20 10"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle className="fill-purple-400 stroke-none" cx="20" cy="10" r="1.5" />
    </svg>
  );
}
