import React from "react";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

function Loader({ isGlobal, className }: { isGlobal?: boolean; className?: string }): React.JSX.Element {
  return (
    <div className={cn(isGlobal ? "bg-opacity-30 fixed inset-0 flex items-center justify-center bg-black" : "")}>
      <LoaderCircle className={cn("size-6 animate-spin", isGlobal ? "text-primary size-16" : "", className)} />
    </div>
  );
}

export default Loader;
