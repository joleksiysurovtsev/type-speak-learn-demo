import type {
  AlphabetExercise,
  BlockContent,
  BlockSummary,
  DictionaryExercise,
  Exercise,
  Language,
  LocalizedText,
} from "./types";

const rawBaseUrl = (import.meta.env?.VITE_BFF_URL ?? "").trim();
export const BFF_BASE_URL = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

type RawLocalized<T> = Record<string, T> | undefined;

type RawBlockSummary = Omit<BlockSummary, "title" | "description"> & {
  title: Record<string, string>;
  description: Record<string, string>;
};

type RawBlockContent = {
  id: string;
  type: BlockSummary["type"];
  title: Record<string, string>;
  description: Record<string, string>;
  exercises?: RawExercise[];
};

type RawExercise = {
  id: string;
  type: Exercise["type"];
  title: Record<string, string>;
  instructions: Record<string, string>;
  successMessages?: Record<string, string>;
  words?: Record<string, string[]>;
  letters?: Record<string, RawAlphabetLetter[]>;
};

type RawAlphabetLetter = {
  letter: string;
  uppercase: string;
  lowercase: string;
};

const withBaseUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!BFF_BASE_URL) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  return `${BFF_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");

  const response = await fetch(withBaseUrl(path), {
    ...init,
    headers,
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Request to ${path} failed with ${response.status}: ${payload || response.statusText}`);
  }

  return response.json() as Promise<T>;
};

const normalizeLocalized = <T>(value: RawLocalized<T>): LocalizedText<T> => ({
  uk: value?.uk,
  ru: value?.ru,
  pl: value?.pl,
  en: value?.en,
});

const pickLocalized = <T>(value: RawLocalized<T>, language: Language): T | undefined => {
  if (!value) {
    return undefined;
  }

  return value[language] ?? value.en ?? Object.values(value)[0];
};

const mapExercise = (raw: RawExercise, language: Language): Exercise | null => {
  const base = {
    id: raw.id,
    title: pickLocalized(raw.title, language) ?? "",
    instructions: pickLocalized(raw.instructions, language) ?? "",
    successMessage: pickLocalized(raw.successMessages, language),
  };

  if (raw.type === "dictionary") {
    const words = pickLocalized(raw.words, language) ?? [];
    const exercise: DictionaryExercise = {
      ...base,
      type: "dictionary",
      words: Array.isArray(words) ? [...words] : [],
    };
    return exercise;
  }

  if (raw.type === "alphabet") {
    const letters = pickLocalized(raw.letters, language) ?? [];
    const exercise: AlphabetExercise = {
      ...base,
      type: "alphabet",
      letters: Array.isArray(letters) ? letters.map((letter) => ({ ...letter })) : [],
    };
    return exercise;
  }

  return null;
};

const mapBlockContent = (raw: RawBlockContent, language: Language): BlockContent => ({
  id: raw.id,
  type: raw.type,
  title: pickLocalized(raw.title, language) ?? "",
  description: pickLocalized(raw.description, language) ?? "",
  exercises:
    raw.exercises
      ?.map((exercise) => mapExercise(exercise, language))
      .filter((exercise): exercise is Exercise => Boolean(exercise)) ?? [],
});

export const getBlocks = async (): Promise<BlockSummary[]> => {
  const response = await requestJson<RawBlockSummary[]>("/api/blocks");
  return response.map((summary) => ({
    ...summary,
    title: normalizeLocalized(summary.title),
    description: normalizeLocalized(summary.description),
  }));
};

export const getBlockContent = async (blockId: string, language: Language): Promise<BlockContent> => {
  const response = await requestJson<RawBlockContent>(`/api/blocks/${blockId}/content`);
  return mapBlockContent(response, language);
};

export const getAlphabet = async (language: Language): Promise<AlphabetExercise> => {
  const response = await requestJson<RawBlockContent>("/api/blocks/block-1/content");
  const content = mapBlockContent(response, language);
  const exercise = content.exercises.find((item): item is AlphabetExercise => item.type === "alphabet");

  if (!exercise) {
    throw new Error("Alphabet exercise data is unavailable");
  }

  return exercise;
};
