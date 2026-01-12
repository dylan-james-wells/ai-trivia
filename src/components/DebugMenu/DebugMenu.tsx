"use client";

import { useState } from "react";
import { GameState, Question } from "@/types/game";

interface DebugMenuProps {
  gameState: GameState;
  onUpdateGameState: (updater: (prev: GameState) => GameState) => void;
}

export function DebugMenu({ gameState, onUpdateGameState }: DebugMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (process.env.NEXT_PUBLIC_DEV_MODE !== "1") {
    return null;
  }

  const handleCompleteAllQuestions = () => {
    onUpdateGameState((prev) => ({
      ...prev,
      questions: prev.questions.map((q: Question) => ({
        ...q,
        answered: true,
      })),
    }));
  };

  const handleSetScore = (score: number) => {
    onUpdateGameState((prev) => ({
      ...prev,
      players: prev.players.map((p, i) =>
        i === prev.currentPlayerIndex ? { ...p, score } : p
      ),
    }));
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-sm font-mono border border-gray-600"
      >
        {isOpen ? "× DEBUG" : "DEBUG"}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-600 rounded shadow-lg p-3 min-w-[200px]">
          <div className="space-y-2">
            <button
              onClick={handleCompleteAllQuestions}
              disabled={gameState.phase !== "playing"}
              className="w-full text-left px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white"
            >
              Complete All Questions
            </button>
            <button
              onClick={() => handleSetScore(-1000)}
              disabled={gameState.phase !== "playing"}
              className="w-full text-left px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white"
            >
              Set Current Player: -$1000
            </button>
            <button
              onClick={() => handleSetScore(0)}
              disabled={gameState.phase !== "playing"}
              className="w-full text-left px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white"
            >
              Set Current Player: $0
            </button>
            <button
              onClick={() => handleSetScore(1000)}
              disabled={gameState.phase !== "playing"}
              className="w-full text-left px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white"
            >
              Set Current Player: $1000
            </button>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-600 text-xs text-gray-400">
            Current: {gameState.players[gameState.currentPlayerIndex]?.name || "N/A"}
          </div>
        </div>
      )}
    </div>
  );
}
