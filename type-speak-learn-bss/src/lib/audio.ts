import { BFF_BASE_URL } from "./api";
import type { Language } from "./types";

const LANGUAGE_TO_LOCALE: Record<Language, string> = {
  uk: "uk-UA",
  ru: "ru-RU",
  pl: "pl-PL",
  en: "en-US",
};

const buildTtsUrl = () => {
  const base = BFF_BASE_URL || "";
  return `${base}/api/tts/preview`;
};

export const playTextToSpeech = async (text: string, language: Language): Promise<void> => {
  const trimmed = text?.trim();
  if (!trimmed) {
    return;
  }

  const locale = LANGUAGE_TO_LOCALE[language] ?? LANGUAGE_TO_LOCALE.en;

  try {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.lang = locale;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      return;
    }
  } catch (error) {
    console.warn("Falling back to BFF TTS after speech synthesis failure", error);
  }

  try {
    const response = await fetch(buildTtsUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ text: trimmed, language }),
    });

    if (!response.ok) {
      throw new Error(`TTS preview failed with status ${response.status}`);
    }

    const payload: { audioUrl?: string | null } = await response.json();

    if (payload.audioUrl && typeof Audio !== "undefined") {
      const audio = new Audio(payload.audioUrl);
      await audio.play().catch((error) => {
        console.warn("Audio playback interrupted", error);
      });
    }
  } catch (error) {
    console.error("Unable to play audio via BFF preview", error);
  }
};
