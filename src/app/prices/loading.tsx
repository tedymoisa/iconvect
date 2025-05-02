import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="bg-background flex h-full w-full items-center justify-center p-54">
      <LoaderCircle className="text-primary size-16 animate-spin" />
    </div>
  );
}
