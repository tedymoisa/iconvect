import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { AI_MODELS } from "@/lib/constants";
import { useModelStore } from "@/store/model";
import { ChevronDown, Brain, Coins } from "lucide-react";
import { memo } from "react";

type ModelSelectorProps = {
  isPending: boolean;
};

function ModelSelector({ isPending }: ModelSelectorProps) {
  console.log("ModelSelector");

  const selectedModel = useModelStore((s) => s.selectedModel);
  const setSelectedModel = useModelStore((s) => s.setSelectedModel);

  return (
    <div className="mx-auto flex items-center gap-2 sm:mx-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="text-muted-foreground focus:border-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
            size="sm"
            disabled={isPending}
          >
            {selectedModel.name} <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Svg Generator Models</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(AI_MODELS).map(([model, option]) => (
            <DropdownMenuItem
              key={model}
              onClick={() => setSelectedModel(option)}
              className={
                selectedModel.name === option.name ? "text-primary cursor-pointer font-bold" : "cursor-pointer"
              }
            >
              <div>
                <div>{option.name}</div>
                <div className="text-muted-foreground text-xs">{option.description}</div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="text-muted-foreground flex items-center gap-1 text-sm">
        {selectedModel.description} <Brain className="h-4 w-4" />
      </div>
      <div className="text-muted-foreground flex items-center gap-1 border-l-2 pl-2 text-sm">
        Cost: <span className="text-primary font-bold">{selectedModel.cost}</span>
        <Coins className="h-4 w-4" />
      </div>
    </div>
  );
}

export default memo(ModelSelector);
