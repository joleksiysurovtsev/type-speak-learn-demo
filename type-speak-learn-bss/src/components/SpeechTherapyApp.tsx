import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Menu, Volume2, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LanguageSelector } from "./LanguageSelector";
import { BlockNavigation } from "./BlockNavigation";
import { Block0TransparentText } from "./blocks/Block0TransparentText";
import { Block1Letters } from "./blocks/Block1Letters";
import { getAlphabet, getBlockContent, getBlocks } from "@/lib/api";
import { playTextToSpeech } from "@/lib/audio";
import type { BlockSummary, DictionaryExercise, Language, LocalizedText } from "@/lib/types";

export const SpeechTherapyApp = () => {
  const queryClient = useQueryClient();
  const [currentLanguage, setCurrentLanguage] = useState<Language>("uk");
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const blocksQuery = useQuery({
    queryKey: ["blocks"],
    queryFn: getBlocks,
    staleTime: 5 * 60 * 1000,
  });

  const blocks = useMemo(() => blocksQuery.data ?? [], [blocksQuery.data]);

  useEffect(() => {
    if (blocks.length && !currentBlockId) {
      setCurrentBlockId(blocks[0].id);
    }
  }, [blocks, currentBlockId]);

  const currentBlock: BlockSummary | null = useMemo(() => {
    if (!blocks.length) {
      return null;
    }

    if (currentBlockId) {
      const found = blocks.find((block) => block.id === currentBlockId);
      if (found) {
        return found;
      }
    }

    return blocks[0] ?? null;
  }, [blocks, currentBlockId]);

  useEffect(() => {
    if (!currentBlock) {
      return;
    }

    if (currentBlock.id === "block-1") {
      queryClient.prefetchQuery({
        queryKey: ["alphabet", currentLanguage],
        queryFn: () => getAlphabet(currentLanguage),
      });
      return;
    }

    queryClient.prefetchQuery({
      queryKey: ["block-content", currentBlock.id, currentLanguage],
      queryFn: () => getBlockContent(currentBlock.id, currentLanguage),
    });
  }, [currentBlock, currentLanguage, queryClient]);

  const blockContentQuery = useQuery({
    queryKey: ["block-content", currentBlock?.id, currentLanguage],
    queryFn: () => {
      if (!currentBlock?.id) {
        throw new Error("Block identifier is required");
      }

      return getBlockContent(currentBlock.id, currentLanguage);
    },
    enabled: Boolean(currentBlock?.id && currentBlock.id !== "block-1"),
    staleTime: 60 * 1000,
  });

  const alphabetQuery = useQuery({
    queryKey: ["alphabet", currentLanguage],
    queryFn: () => getAlphabet(currentLanguage),
    enabled: currentBlock?.id === "block-1",
    staleTime: 60 * 1000,
  });

  const isContentLoading = currentBlock?.id === "block-1" ? alphabetQuery.isLoading : blockContentQuery.isLoading;
  const contentError = (currentBlock?.id === "block-1" ? alphabetQuery.error : blockContentQuery.error) as
    | Error
    | null
    | undefined;

  const dictionaryExercise = useMemo(() => {
    if (!blockContentQuery.data) {
      return undefined;
    }

    return blockContentQuery.data.exercises.find(
      (exercise): exercise is DictionaryExercise => exercise.type === "dictionary",
    );
  }, [blockContentQuery.data]);

  const alphabetExercise = alphabetQuery.data;

  const blockIndex = useMemo(() => {
    if (!currentBlock) {
      return -1;
    }
    return blocks.findIndex((block) => block.id === currentBlock.id);
  }, [blocks, currentBlock]);

  const localizedTitle = useMemo(
    () => getLocalized(currentBlock?.title, currentLanguage, currentBlock?.id ?? ""),
    [currentBlock, currentLanguage],
  );

  const localizedDescription = useMemo(
    () => getLocalized(currentBlock?.description, currentLanguage, ""),
    [currentBlock, currentLanguage],
  );

  const handleBlockChange = useCallback((blockId: string) => {
    setCurrentBlockId(blockId);
  }, []);

  const handleLanguageChange = useCallback((language: Language) => {
    setCurrentLanguage(language);
  }, []);

  const handlePlayAudio = useCallback(
    (text: string) => {
      void playTextToSpeech(text, currentLanguage);
    },
    [currentLanguage],
  );

  const renderCurrentBlock = () => {
    if (!currentBlock) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground text-xl">No blocks available yet</p>
        </div>
      );
    }

    if (isContentLoading) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading learning materials...
        </div>
      );
    }

    if (contentError) {
      const onRetry = currentBlock.id === "block-1" ? alphabetQuery.refetch : blockContentQuery.refetch;
      return (
        <div className="flex flex-col items-center justify-center gap-4 h-64 text-center">
          <p className="text-muted-foreground">{contentError.message || "Unable to load block content."}</p>
          <Button variant="outline" onClick={() => void onRetry()}>
            Try again
          </Button>
        </div>
      );
    }

    if (currentBlock.id === "block-0" && dictionaryExercise) {
      return (
        <Block0TransparentText
          language={currentLanguage}
          onPlayAudio={handlePlayAudio}
          exercise={dictionaryExercise}
        />
      );
    }

    if (currentBlock.id === "block-1" && alphabetExercise) {
      return (
        <Block1Letters
          language={currentLanguage}
          onPlayAudio={handlePlayAudio}
          exercise={alphabetExercise}
        />
      );
    }

    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-xl">Block {localizedTitle} coming soon!</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-gentle">
      <div className="flex">
        {/* Sidebar */}
        <div
          className={`bg-card border-r border-border transition-all duration-300 ${
            isSidebarOpen ? "w-80" : "w-0"
          } overflow-hidden`}
        >
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Speech Therapy
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <LanguageSelector currentLanguage={currentLanguage} onLanguageChange={handleLanguageChange} />

            <BlockNavigation
              blocks={blocks}
              currentBlockId={currentBlock?.id ?? null}
              onBlockChange={handleBlockChange}
              language={currentLanguage}
              isLoading={blocksQuery.isLoading}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-screen">
          {/* Header */}
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {!isSidebarOpen && (
                  <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(true)}>
                    <Menu className="h-4 w-4" />
                  </Button>
                )}
                <h1 className="text-xl font-semibold text-foreground">
                  {localizedTitle || "Loading blocks..."}
                  {blockIndex >= 0 && blocks.length ? ` • ${blockIndex + 1}/${blocks.length}` : ""}
                </h1>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePlayAudio(localizedDescription || localizedTitle)}
                className="flex items-center gap-2"
                disabled={!localizedDescription && !localizedTitle}
              >
                <Volume2 className="h-4 w-4" />
                <span className="hidden sm:inline">Help Audio</span>
              </Button>
            </div>
          </header>

          {/* Main Learning Area */}
          <main className="p-6">
            <Card className="shadow-gentle border-0 bg-card/50 backdrop-blur-sm">
              <div className="p-8">
                {blocksQuery.isLoading ? (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading blocks...
                  </div>
                ) : blocksQuery.error ? (
                  <div className="flex flex-col items-center justify-center gap-4 h-64 text-center">
                    <p className="text-muted-foreground">
                      {(blocksQuery.error as Error).message || "Unable to load blocks from the server."}
                    </p>
                    <Button variant="outline" onClick={() => void blocksQuery.refetch()}>
                      Retry
                    </Button>
                  </div>
                ) : (
                  renderCurrentBlock()
                )}
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

const getLocalized = (value: LocalizedText | undefined, language: Language, fallback: string): string => {
  if (!value) {
    return fallback;
  }

  return value[language] ?? value.en ?? fallback;
};
