import React from "react";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

function Loader({ isGlobal, className }: { isGlobal?: boolean; className?: string }): React.JSX.Element {
  return (
    <div className={cn(isGlobal ? "fixed inset-0 flex items-center justify-center bg-black bg-opacity-30" : "")}>
      <LoaderCircle className={cn("size-6 animate-spin", isGlobal ? "size-16 text-primary" : "", className)} />
    </div>
  );
}

export default Loader;
