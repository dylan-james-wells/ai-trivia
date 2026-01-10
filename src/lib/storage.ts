import { GameState, Player, Category, Question } from "@/types/game";

const STORAGE_KEY = "ai-trivia-game";

export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadGameState(): GameState | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as GameState;
  } catch {
    return null;
  }
}

export function clearGameState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function createInitialState(): GameState {
  return {
    phase: "menu",
    players: [],
    categories: [],
    questions: [],
    currentPlayerIndex: 0,
    selectedQuestion: null,
  };
}
