import { Button } from "@/components/ui/button";
import SvgLoading from "../svg-loading";
import { memo } from "react";
import { X } from "lucide-react";

const GenerationPending = () => {
  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="w-full">
        <SvgLoading />
      </div>
      <div className="mx-auto sm:mx-0">
        <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default memo(GenerationPending);
