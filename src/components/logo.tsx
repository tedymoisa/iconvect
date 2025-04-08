import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={cn(className)}>
      <defs>
        <style>
          {`
            .vecto-logo-v-stroke {
              stroke: #7C3AED; /* primary (purple-600) */
              stroke-width: 2;
              stroke-linecap: round;
              stroke-linejoin: round;
              fill: none;
            }
            .vecto-logo-anchor-point {
              fill: #14B8A6; /* secondary (teal-500) */
              stroke: none;
            }
          `}
        </style>
      </defs>

      <path className="vecto-logo-v-stroke" d="M 4 4 L 10 18 L 16 4 C 16 4 18 6 20 10" />

      <circle className="vecto-logo-anchor-point" cx="20" cy="10" r="1.5" />
    </svg>
  );
}
