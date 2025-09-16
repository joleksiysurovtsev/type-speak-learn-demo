import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Loader2, Lock } from "lucide-react";
import type { BlockSummary, Language, LocalizedText } from "@/lib/types";

interface BlockNavigationProps {
  blocks: BlockSummary[];
  currentBlockId: string | null;
  onBlockChange: (blockId: string) => void;
  language: Language;
  isLoading?: boolean;
}

interface NavigationItem {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  index: number;
  progress: number;
}

export const BlockNavigation = ({
  blocks,
  currentBlockId,
  onBlockChange,
  language,
  isLoading = false,
}: BlockNavigationProps) => {
  const items = useMemo<NavigationItem[]>(
    () =>
      blocks.map((block, index) => ({
        id: block.id,
        title: getLocalized(block.title, language, `Block ${index + 1}`),
        description: getLocalized(block.description, language, ""),
        unlocked: block.unlocked,
        index,
        progress: block.progress ?? 0,
      })),
    [blocks, language],
  );

  const currentIndex = useMemo(
    () => items.findIndex((item) => item.id === currentBlockId),
    [items, currentBlockId],
  );

  const progressValue = useMemo(() => {
    if (!items.length || currentIndex < 0) {
      return 0;
    }

    return Math.min(100, ((currentIndex + 1) / items.length) * 100);
  }, [items.length, currentIndex]);

  if (isLoading && !items.length) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading blocks...
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-sm text-muted-foreground">
        Blocks will appear here once they are available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Learning Blocks</h3>
        <Progress value={progressValue} className="h-2" />
        {currentIndex >= 0 ? (
          <p className="text-sm text-muted-foreground">
            Block {currentIndex + 1} of {items.length}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">{items.length} blocks available</p>
        )}
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const isCurrent = item.id === currentBlockId;
          const isUnlocked = item.unlocked;
          const icon = getBlockIcon(isUnlocked, isCurrent);

          return (
            <Button
              key={item.id}
              variant={isCurrent ? "default" : "outline"}
              disabled={!isUnlocked}
              onClick={() => isUnlocked && onBlockChange(item.id)}
              className={`w-full justify-start h-12 transition-all duration-200 ${
                isCurrent
                  ? "shadow-interactive bg-gradient-primary"
                  : isUnlocked
                  ? "hover:shadow-gentle hover:scale-102"
                  : "opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                {icon}
                <div className="text-left">
                  <div className="font-semibold truncate">{item.title}</div>
                  <div className="text-xs opacity-75 truncate">
                    {item.description || `Progress ${Math.round(item.progress * 100)}%`}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

const getBlockIcon = (unlocked: boolean, isCurrent: boolean) => {
  if (!unlocked) {
    return <Lock className="h-4 w-4" />;
  }

  if (isCurrent) {
    return <Circle className="h-4 w-4 fill-primary" />;
  }

  return <CheckCircle className="h-4 w-4 text-success" />;
};

const getLocalized = (value: LocalizedText | undefined, language: Language, fallback: string): string => {
  if (!value) {
    return fallback;
  }

  return value[language] ?? value.en ?? fallback;
};
