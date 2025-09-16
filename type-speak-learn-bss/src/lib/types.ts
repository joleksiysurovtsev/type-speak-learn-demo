export type Language = "uk" | "ru" | "pl" | "en";

export type ExerciseType = "dictionary" | "alphabet";

export interface LocalizedText<T = string> {
  uk?: T;
  ru?: T;
  pl?: T;
  en?: T;
}

export interface BlockSummary {
  id: string;
  type: ExerciseType;
  title: LocalizedText;
  description: LocalizedText;
  unlocked: boolean;
  progress: number;
}

export interface DictionaryExercise {
  id: string;
  type: "dictionary";
  title: string;
  instructions: string;
  successMessage?: string;
  words: string[];
}

export interface AlphabetLetter {
  letter: string;
  uppercase: string;
  lowercase: string;
}

export interface AlphabetExercise {
  id: string;
  type: "alphabet";
  title: string;
  instructions: string;
  successMessage?: string;
  letters: AlphabetLetter[];
}

export type Exercise = DictionaryExercise | AlphabetExercise;

export interface BlockContent {
  id: string;
  type: ExerciseType;
  title: string;
  description: string;
  exercises: Exercise[];
}
