import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle, RotateCcw, Volume2 } from "lucide-react";
import type { AlphabetExercise, Language } from "@/lib/types";

interface Block1LettersProps {
  language: Language;
  onPlayAudio: (text: string) => void;
  exercise: AlphabetExercise;
}

const ENCOURAGEMENT_BY_LANGUAGE: Record<Language, string> = {
  uk: "Спробуй ще раз!",
  ru: "Попробуй ещё раз!",
  pl: "Spróbuj ponownie!",
  en: "Try again!",
};

export const Block1Letters = ({ language, onPlayAudio, exercise }: Block1LettersProps) => {
  const [currentLetter, setCurrentLetter] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const resetTimerRef = useRef<number | null>(null);

  const letters = useMemo(() => exercise.letters ?? [], [exercise.letters]);
  const instructions = useMemo(() => exercise.instructions ?? "", [exercise.instructions]);
  const successText = useMemo(() => exercise.successMessage ?? "Great! That's correct!", [exercise.successMessage]);
  const encouragement = useMemo(
    () => ENCOURAGEMENT_BY_LANGUAGE[language] ?? ENCOURAGEMENT_BY_LANGUAGE.en,
    [language],
  );
  const hasLetters = letters.length > 0;

  useEffect(() => {
    if (hasLetters) {
      setCurrentLetter(letters[0].letter);
    } else {
      setCurrentLetter("");
    }
    setUserInput("");
    setIsCompleted(false);
    setShowSuccess(false);
    setAttempts(0);

    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, [letters, hasLetters]);

  useEffect(() => () => {
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
    }
  }, []);

  const playCurrentLetter = useCallback(() => {
    if (!currentLetter) {
      return;
    }

    onPlayAudio(currentLetter);
  }, [currentLetter, onPlayAudio]);

  const nextLetter = useCallback(() => {
    if (!hasLetters) {
      return;
    }

    const index = Math.max(0, letters.findIndex((item) => item.letter === currentLetter));
    const nextIndex = (index + 1) % letters.length;
    const next = letters[nextIndex];

    setCurrentLetter(next.letter);
    setUserInput("");
    setIsCompleted(false);
    setShowSuccess(false);
    setAttempts(0);
  }, [currentLetter, hasLetters, letters]);

  const resetLetter = useCallback(() => {
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    setUserInput("");
    setIsCompleted(false);
    setShowSuccess(false);
    setAttempts(0);
  }, []);

  const setRandomLetter = useCallback(() => {
    if (!hasLetters) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * letters.length);
    const random = letters[randomIndex];

    setCurrentLetter(random.letter);
    setUserInput("");
    setIsCompleted(false);
    setShowSuccess(false);
    setAttempts(0);
  }, [hasLetters, letters]);

  const handleInputChange = useCallback(
    (value: string) => {
      setUserInput(value);
      setAttempts((prev) => prev + 1);

      if (!currentLetter) {
        return;
      }

      if (value.trim().toUpperCase() === currentLetter.trim().toUpperCase()) {
        setIsCompleted(true);
        setShowSuccess(true);
        playCurrentLetter();

        if (resetTimerRef.current) {
          window.clearTimeout(resetTimerRef.current);
        }

        resetTimerRef.current = window.setTimeout(() => {
          nextLetter();
        }, 1500);
      } else if (value.length > 0) {
        if (resetTimerRef.current) {
          window.clearTimeout(resetTimerRef.current);
        }
        resetTimerRef.current = window.setTimeout(() => {
          setUserInput("");
        }, 800);
      }
    },
    [currentLetter, nextLetter, playCurrentLetter],
  );

  const progressLabel = useMemo(() => {
    if (!hasLetters || !currentLetter) {
      return "";
    }

    const index = Math.max(0, letters.findIndex((item) => item.letter === currentLetter));
    return `Letter: ${currentLetter} | Position: ${index + 1}/${letters.length}`;
  }, [currentLetter, hasLetters, letters]);

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-bold text-foreground">{instructions}</h2>

        {/* Large Letter Display */}
        <div className="relative">
          <div className="bg-gradient-primary p-8 rounded-2xl shadow-interactive inline-block">
            <span className="text-8xl font-bold text-primary-foreground select-none">
              {currentLetter || ""}
            </span>
          </div>

          {/* Audio Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={playCurrentLetter}
            className="absolute -top-2 -right-2 shadow-gentle hover:shadow-interactive"
            disabled={!currentLetter}
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-4">
        <div className="relative">
          <Input
            value={userInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type the letter..."
            className={`text-4xl h-20 text-center font-bold transition-all duration-300 ${
              isCompleted
                ? "border-success shadow-success bg-success/5"
                : attempts > 0 && !isCompleted
                ? "border-warning animate-shake"
                : "focus:shadow-interactive"
            }`}
            maxLength={1}
            disabled={isCompleted || !hasLetters}
            autoComplete="off"
          />

          {isCompleted && (
            <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-8 w-8 text-success animate-bounce-gentle" />
          )}
        </div>

        {/* Feedback Messages */}
        {showSuccess && (
          <div className="bg-gradient-success text-success-foreground p-4 rounded-lg text-center animate-fade-in">
            <p className="text-lg font-semibold">{successText}</p>
          </div>
        )}

        {attempts > 0 && !isCompleted && (
          <div className="bg-warning/20 text-warning-foreground p-3 rounded-lg text-center animate-fade-in">
            <p className="font-medium">{encouragement}</p>
          </div>
        )}

        {!hasLetters && (
          <div className="text-sm text-muted-foreground text-center">
            Alphabet letters are unavailable for this language.
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-4 flex-wrap">
        <Button
          variant="outline"
          onClick={playCurrentLetter}
          className="flex items-center gap-2 shadow-gentle hover:shadow-interactive"
          disabled={!currentLetter}
        >
          <Volume2 className="h-4 w-4" />
          Play Letter
        </Button>

        <Button
          variant="outline"
          onClick={resetLetter}
          className="flex items-center gap-2"
          disabled={!hasLetters}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>

        <Button
          variant="outline"
          onClick={setRandomLetter}
          className="flex items-center gap-2"
          disabled={!hasLetters}
        >
          🎲 Random
        </Button>

        <Button
          onClick={nextLetter}
          className="bg-gradient-primary shadow-interactive hover:scale-105 flex items-center gap-2"
          disabled={!hasLetters}
        >
          Next Letter
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="text-center space-y-2">
        {progressLabel ? (
          <p className="text-muted-foreground">{progressLabel}</p>
        ) : (
          <p className="text-muted-foreground">Select a letter to begin.</p>
        )}
        {attempts > 0 && (
          <p className="text-sm text-muted-foreground">Attempts: {attempts}</p>
        )}
      </div>
    </div>
  );
};
