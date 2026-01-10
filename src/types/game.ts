export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface Question {
  id: string;
  categoryIndex: number;
  difficulty: number;
  points: number;
  question: string;
  answer: string;
  answered: boolean;
  answeredBy?: string;
  correct?: boolean;
}

export interface Category {
  name: string;
  confirmed: boolean;
  aiInterpretation?: string;
}

export interface GameState {
  phase: 'setup' | 'categories' | 'playing' | 'finished';
  players: Player[];
  categories: Category[];
  questions: Question[];
  currentPlayerIndex: number;
  selectedQuestion: Question | null;
}

export const POINTS_PER_DIFFICULTY = [200, 400, 600, 800, 1000];
export const QUESTIONS_PER_CATEGORY = 5;
export const TOTAL_CATEGORIES = 6;
