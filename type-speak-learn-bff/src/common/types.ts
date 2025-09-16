export const LANGUAGE_CODES = ["uk", "en", "ru", "pl"] as const;
export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export type LocalizedText = Partial<Record<LanguageCode, string>>;
export type LocalizedStrings = Partial<Record<LanguageCode, string[]>>;

export interface AlphabetLetter {
  letter: string;
  uppercase?: string;
  lowercase?: string;
  transliteration?: string;
  audioUrl?: string;
}

export type LocalizedAlphabetLetters = Partial<Record<LanguageCode, AlphabetLetter[]>>;

export const EXERCISE_TYPES = ["dictionary", "alphabet"] as const;
export type ExerciseType = (typeof EXERCISE_TYPES)[number];

export interface ExerciseBase {
  id: string;
  type: ExerciseType;
  title: LocalizedText;
  instructions: LocalizedText;
  successMessages?: LocalizedText;
}

export interface DictionaryExercise extends ExerciseBase {
  type: "dictionary";
  words: LocalizedStrings;
}

export interface AlphabetExercise extends ExerciseBase {
  type: "alphabet";
  letters: LocalizedAlphabetLetters;
}

export type Exercise = DictionaryExercise | AlphabetExercise;

export interface BlockSummary {
  id: string;
  type: ExerciseType;
  title: LocalizedText;
  description: LocalizedText;
  unlocked: boolean;
  progress: number;
}

export interface BlockContent {
  id: string;
  type: ExerciseType;
  title: LocalizedText;
  description: LocalizedText;
  exercises: Exercise[];
}
