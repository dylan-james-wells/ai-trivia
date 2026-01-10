"use client";

import { useState, useEffect } from "react";
import { PlayerSetup } from "@/components/PlayerSetup";
import { CategorySetup } from "@/components/CategorySetup";
import { GameBoard } from "@/components/GameBoard";
import { QuestionModal, QuestionResult } from "@/components/QuestionModal";
import { AudioControls } from "@/components/AudioControls";
import {
  GameState,
  Player,
  Category,
  Question,
} from "@/types/game";
import { saveGameState, loadGameState, clearGameState, createInitialState } from "@/lib/storage";
import { audioManager, MusicTrack } from "@/lib/audio";
import { createDevGameState } from "@/lib/dev-game";

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  // Check if all questions are answered (game over)
  const isGameOver = gameState.phase === "playing" &&
    gameState.questions.length > 0 &&
    gameState.questions.every((q) => q.answered);

  // Determine current music track based on game state
  const getCurrentTrack = (): MusicTrack => {
    if (gameState.phase === "menu" || gameState.phase === "setup" || gameState.phase === "categories") {
      return "setup";
    } else if (gameState.phase === "playing") {
      if (isGameOver) {
        return "victory";
      } else if (gameState.selectedQuestion) {
        return "question";
      } else {
        return "board";
      }
    } else if (gameState.phase === "finished") {
      return "victory";
    }
    return "none";
  };

  const currentTrack = getCurrentTrack();

  // Load saved game state on mount
  useEffect(() => {
    const saved = loadGameState();
    if (saved) {
      setGameState(saved);
    }
    setLoading(false);
  }, []);

  // Save game state on changes
  useEffect(() => {
    if (!loading) {
      saveGameState(gameState);
    }
  }, [gameState, loading]);

  const handlePlayersComplete = (players: Player[]) => {
    setGameState((prev) => ({
      ...prev,
      players,
      phase: "categories",
    }));
  };

  const handleCategoriesComplete = async (categories: Category[]) => {
    setGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate questions");
      }

      setGameState((prev) => ({
        ...prev,
        categories,
        questions: data.questions,
        phase: "playing",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectQuestion = (question: Question) => {
    setGameState((prev) => ({
      ...prev,
      selectedQuestion: question,
    }));
  };

  const handleQuestionComplete = (result: QuestionResult) => {
    const { selectedQuestion, players, currentPlayerIndex } = gameState;
    if (!selectedQuestion) return;

    let updatedPlayers = [...players];
    let answeredBy: string | undefined;
    let correct: boolean | undefined;

    if (result.type === "answered") {
      // Someone answered - update their score
      const pointChange = result.correct ? selectedQuestion.points : -selectedQuestion.points;
      updatedPlayers[result.playerIndex] = {
        ...updatedPlayers[result.playerIndex],
        score: updatedPlayers[result.playerIndex].score + pointChange,
      };
      answeredBy = players[result.playerIndex].id;
      correct = result.correct;
    }
    // If result.type === "skipped", no score changes, just mark as answered

    const updatedQuestions = gameState.questions.map((q) =>
      q.id === selectedQuestion.id
        ? { ...q, answered: true, answeredBy, correct }
        : q
    );

    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;

    setGameState((prev) => ({
      ...prev,
      players: updatedPlayers,
      questions: updatedQuestions,
      currentPlayerIndex: nextPlayerIndex,
      selectedQuestion: null,
    }));
  };

  const handleQuestionRegenerate = (newQuestion: string, newAnswer: string) => {
    const { selectedQuestion } = gameState;
    if (!selectedQuestion) return;

    // Update the question in the questions array
    const updatedQuestions = gameState.questions.map((q) =>
      q.id === selectedQuestion.id
        ? { ...q, question: newQuestion, answer: newAnswer }
        : q
    );

    // Also update the selected question
    setGameState((prev) => ({
      ...prev,
      questions: updatedQuestions,
      selectedQuestion: {
        ...selectedQuestion,
        question: newQuestion,
        answer: newAnswer,
      },
    }));
  };

  const handleBackToMenu = () => {
    setGameState((prev) => ({
      ...prev,
      phase: "menu",
    }));
  };

  const handleBackToPlayers = () => {
    setGameState((prev) => ({
      ...prev,
      phase: "setup",
    }));
  };

  const handleStartGame = () => {
    setGameState((prev) => ({
      ...prev,
      phase: "setup",
    }));
  };

  const handleNewGame = () => {
    clearGameState();
    setGameState(createInitialState());
  };

  const handleStartDevGame = () => {
    setGameState(createDevGameState());
  };

  // Get category for the selected question
  const getSelectedCategory = (): Category | undefined => {
    if (!gameState.selectedQuestion) return undefined;
    return gameState.categories[gameState.selectedQuestion.categoryIndex];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">AI Trivia</h1>
        <p className="text-blue-300">Jeopardy-style game powered by AI</p>
        {gameState.phase !== "menu" && (
          <button
            onClick={handleNewGame}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Main Menu
          </button>
        )}
      </header>

      {error && (
        <div className="max-w-md mx-auto mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {generating && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-900">Generating trivia questions...</p>
            <p className="text-gray-600 text-sm mt-2">This may take a moment</p>
          </div>
        </div>
      )}

      {gameState.phase === "menu" && (
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white/10 backdrop-blur rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Welcome to AI Trivia!</h2>
            <p className="text-blue-200 mb-8">
              A Jeopardy-style trivia game where AI generates questions and judges your answers.
            </p>
            <button
              onClick={handleStartGame}
              className="w-full py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Game
            </button>
            <button
              onClick={handleStartDevGame}
              className="w-full mt-3 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Start Dev Game
            </button>
          </div>
        </div>
      )}

      {gameState.phase === "setup" && (
        <PlayerSetup onComplete={handlePlayersComplete} onBack={handleBackToMenu} />
      )}

      {gameState.phase === "categories" && (
        <CategorySetup
          onComplete={handleCategoriesComplete}
          onBack={handleBackToPlayers}
        />
      )}

      {gameState.phase === "playing" && (
        <GameBoard
          categories={gameState.categories}
          questions={gameState.questions}
          players={gameState.players}
          currentPlayerIndex={gameState.currentPlayerIndex}
          onSelectQuestion={handleSelectQuestion}
        />
      )}

      {gameState.selectedQuestion && getSelectedCategory() && (
        <QuestionModal
          question={gameState.selectedQuestion}
          category={getSelectedCategory()!}
          players={gameState.players}
          currentPlayerIndex={gameState.currentPlayerIndex}
          onComplete={handleQuestionComplete}
          onRegenerate={handleQuestionRegenerate}
        />
      )}

      {/* Audio Controls */}
      <AudioControls currentTrack={currentTrack} />
    </main>
  );
}
