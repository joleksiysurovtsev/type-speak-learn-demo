import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { SpeechTherapyApp } from "../SpeechTherapyApp";
import { server } from "@/test/server";

const blocksResponse = [
  {
    id: "block-0",
    type: "dictionary" as const,
    title: {
      uk: "Тренування слів",
      en: "Word Training",
    },
    description: {
      uk: "Набір слів для тренування.",
      en: "A set of practice words.",
    },
    unlocked: true,
    progress: 0.35,
  },
  {
    id: "block-1",
    type: "alphabet" as const,
    title: {
      uk: "Букви",
      en: "Letters",
    },
    description: {
      uk: "Вправи з літерами.",
      en: "Alphabet practice.",
    },
    unlocked: true,
    progress: 0.15,
  },
];

const block0Content = {
  id: "block-0",
  type: "dictionary" as const,
  title: {
    uk: "Напівпрозоре слово",
    en: "Transparent Word",
  },
  description: {
    uk: "Слова з підказкою.",
    en: "Hinted words.",
  },
  exercises: [
    {
      id: "transparent-word-typing",
      type: "dictionary" as const,
      title: {
        uk: "Введи слово",
        en: "Type the Word",
      },
      instructions: {
        uk: "Набери слово, що показане напівпрозоро:",
        en: "Type the word shown in transparent text:",
      },
      successMessages: {
        uk: "Відмінно!",
        en: "Excellent!",
      },
      words: {
        uk: ["мама", "тато"],
        en: ["cat", "dog"],
      },
    },
  ],
};

const block1Content = {
  id: "block-1",
  type: "alphabet" as const,
  title: {
    uk: "Алфавітні літери",
    en: "Alphabet Letters",
  },
  description: {
    uk: "Практика літер.",
    en: "Letter practice.",
  },
  exercises: [
    {
      id: "alphabet-drill",
      type: "alphabet" as const,
      title: {
        uk: "Назви й надрукуй літеру",
        en: "Say and Type the Letter",
      },
      instructions: {
        uk: "Подивись на букву і набери її:",
        en: "Look at the letter and type it:",
      },
      successMessages: {
        uk: "Чудово!",
        en: "Great!",
      },
      letters: {
        uk: [
          { letter: "А", uppercase: "А", lowercase: "а" },
          { letter: "Б", uppercase: "Б", lowercase: "б" },
        ],
        en: [
          { letter: "A", uppercase: "A", lowercase: "a" },
          { letter: "B", uppercase: "B", lowercase: "b" },
        ],
      },
    },
  ],
};

const renderApp = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <SpeechTherapyApp />
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  server.use(http.get("http://localhost/api/blocks/block-0/content", () => HttpResponse.json(block0Content)));
});

describe("SpeechTherapyApp", () => {
  it("renders block content from the BFF", async () => {
    server.use(
      http.get("http://localhost/api/blocks", () => HttpResponse.json(blocksResponse)),
      http.get("http://localhost/api/blocks/block-0/content", () => HttpResponse.json(block0Content)),
    );

    renderApp();

    expect(await screen.findByText("Набери слово, що показане напівпрозоро:"))
      .toBeInTheDocument();
    expect(screen.getByText("мама")).toBeInTheDocument();
  });

  it("handles navigation to the alphabet block", async () => {
    server.use(
      http.get("http://localhost/api/blocks", () => HttpResponse.json(blocksResponse)),
      http.get("http://localhost/api/blocks/block-1/content", () => HttpResponse.json(block1Content)),
    );

    renderApp();

    const user = userEvent.setup();

    const blockButton = await screen.findByRole("button", { name: /букви/i });
    await user.click(blockButton);

    expect(await screen.findByText("Подивись на букву і набери її:")).toBeInTheDocument();
    expect(screen.getByText("А")).toBeInTheDocument();
  });

  it("shows an error message when the block list fails to load", async () => {
    server.use(
      http.get("http://localhost/api/blocks", () => HttpResponse.json({ message: "Server error" }, { status: 500 })),
    );

    renderApp();

    expect(await screen.findByText(/request to \/api\/blocks failed/i)).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    server.use(
      http.get("http://localhost/api/blocks", () => HttpResponse.json(blocksResponse)),
      http.get("http://localhost/api/blocks/block-0/content", () => HttpResponse.json(block0Content)),
    );

    const user = userEvent.setup();
    await user.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText("Набери слово, що показане напівпрозоро:")).toBeInTheDocument();
    });
  });
});
