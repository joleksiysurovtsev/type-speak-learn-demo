import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, RotateCcw, Volume2 } from "lucide-react";
import type { DictionaryExercise, Language } from "@/lib/types";

interface Block0TransparentTextProps {
  language: Language;
  onPlayAudio: (text: string) => void;
  exercise: DictionaryExercise;
}

const PLACEHOLDER_BY_LANGUAGE: Record<Language, string> = {
  uk: "Почни друкувати...",
  ru: "Начни печатать...",
  pl: "Zacznij pisać...",
  en: "Start typing...",
};

export const Block0TransparentText = ({ language, onPlayAudio, exercise }: Block0TransparentTextProps) => {
  const [currentWord, setCurrentWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const autoAdvanceRef = useRef<number | null>(null);

  const words = useMemo(() => exercise.words ?? [], [exercise.words]);
  const instructions = useMemo(() => exercise.instructions ?? "", [exercise.instructions]);
  const successText = useMemo(() => exercise.successMessage ?? "Great job!", [exercise.successMessage]);
  const placeholder = useMemo(() => PLACEHOLDER_BY_LANGUAGE[language] ?? PLACEHOLDER_BY_LANGUAGE.en, [language]);
  const hasWords = words.length > 0;

  useEffect(() => {
    if (hasWords) {
      setCurrentWord(words[0]);
    } else {
      setCurrentWord("");
    }
    setUserInput("");
    setIsCompleted(false);
    setShowSuccess(false);

    if (autoAdvanceRef.current) {
      window.clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
  }, [words, hasWords]);

  useEffect(() => () => {
    if (autoAdvanceRef.current) {
      window.clearTimeout(autoAdvanceRef.current);
    }
  }, []);

  const nextWord = useCallback(() => {
    if (!hasWords) {
      return;
    }

    const currentIndex = Math.max(0, words.indexOf(currentWord));
    const nextIndex = (currentIndex + 1) % words.length;
    const nextValue = words[nextIndex];

    setCurrentWord(nextValue);
    setUserInput("");
    setIsCompleted(false);
    setShowSuccess(false);
  }, [currentWord, hasWords, words]);

  const resetWord = useCallback(() => {
    if (autoAdvanceRef.current) {
      window.clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
    setUserInput("");
    setIsCompleted(false);
    setShowSuccess(false);
  }, []);

  const handleInputChange = useCallback(
    (value: string) => {
      setUserInput(value);

      if (!currentWord) {
        return;
      }

      if (value.trim().toLowerCase() === currentWord.trim().toLowerCase()) {
        setIsCompleted(true);
        setShowSuccess(true);
        onPlayAudio(currentWord);

        if (autoAdvanceRef.current) {
          window.clearTimeout(autoAdvanceRef.current);
        }

        autoAdvanceRef.current = window.setTimeout(() => {
          nextWord();
        }, 2000);
      }
    },
    [currentWord, nextWord, onPlayAudio],
  );

  const progressLabel = useMemo(() => {
    if (!hasWords || !currentWord) {
      return "";
    }

    const index = Math.max(0, words.indexOf(currentWord));
    return `Word: ${currentWord} | Progress: ${index + 1}/${words.length}`;
  }, [currentWord, hasWords, words]);

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">{instructions}</h2>

        {/* Transparent Text Overlay */}
        <div className="relative h-24 flex items-center justify-center">
          <div
            className="absolute text-6xl font-bold text-muted-foreground/30 select-none pointer-events-none z-10"
            style={{ letterSpacing: "0.1em" }}
          >
            {currentWord || ""}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-4">
        <div className="relative">
          <Input
            value={userInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className={`text-2xl h-16 text-center text-lg font-medium transition-all duration-300 ${
              isCompleted
                ? "border-success shadow-success bg-success/5"
                : "focus:shadow-interactive"
            }`}
            disabled={isCompleted || !hasWords}
          />

          {isCompleted && (
            <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-success animate-bounce-gentle" />
          )}
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-gradient-success text-success-foreground p-4 rounded-lg text-center animate-fade-in">
            <p className="text-lg font-semibold">{successText}</p>
          </div>
        )}

        {!hasWords && (
          <div className="text-sm text-muted-foreground text-center">
            Words for this exercise are unavailable right now.
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => currentWord && onPlayAudio(currentWord)}
          className="flex items-center gap-2 shadow-gentle hover:shadow-interactive"
          disabled={!currentWord}
        >
          <Volume2 className="h-4 w-4" />
          Play Audio
        </Button>

        <Button
          variant="outline"
          onClick={resetWord}
          className="flex items-center gap-2"
          disabled={!hasWords}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>

        <Button
          onClick={nextWord}
          className="bg-gradient-primary shadow-interactive hover:scale-105"
          disabled={!hasWords}
        >
          Next Word
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="text-center">
        {progressLabel ? (
          <p className="text-muted-foreground">{progressLabel}</p>
        ) : (
          <p className="text-muted-foreground">Select a word to begin.</p>
        )}
      </div>
    </div>
  );
};
