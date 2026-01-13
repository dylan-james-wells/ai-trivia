"use client";

import { useState, useEffect } from "react";
import { PlayerSetup } from "@/components/PlayerSetup";
import { CategorySetup } from "@/components/CategorySetup";
import { GameBoard } from "@/components/GameBoard";
import { QuestionModal, QuestionResult } from "@/components/QuestionModal";
import { AudioControls } from "@/components/AudioControls";
import { GameState, Player, Category, Question } from "@/types/game";
import {
  saveGameState,
  loadGameState,
  clearGameState,
  createInitialState,
} from "@/lib/storage";
import { audioManager, MusicTrack } from "@/lib/audio";
import { createDevGameState } from "@/lib/dev-game";
import { KeyboardButton } from "@/components/KeyboardButton";
import { KeyboardContainer } from "@/components/KeyboardContainer";
import { LogoText } from "@/components/LogoText/LogoText";
import { LoadingIndicator } from "@/components/LoadingIndicator/LoadingIndicator";
import { DebugMenu } from "@/components/DebugMenu/DebugMenu";

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState("");
  const [showQuestion, setShowQuestion] = useState(false);
  const [showMenuConfirm, setShowMenuConfirm] = useState(false);

  // Check if all questions are answered (game over)
  const isGameOver =
    gameState.phase === "playing" &&
    gameState.questions.length > 0 &&
    gameState.questions.every((q) => q.answered);

  // Determine current music track based on game state
  const getCurrentTrack = (): MusicTrack => {
    if (
      gameState.phase === "menu" ||
      gameState.phase === "setup" ||
      gameState.phase === "categories"
    ) {
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
      // If there's a selected question, show it immediately
      if (saved.selectedQuestion) {
        setShowQuestion(true);
      }
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

    // Delay showing loading indicator to allow CategorySetup to scale down
    setTimeout(() => {
      setShowLoading(true);
    }, 300);

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

      // Hide loading indicator first
      setShowLoading(false);

      // After loading scales down, transition to playing phase
      setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          categories,
          questions: data.questions,
          phase: "playing",
        }));
        setGenerating(false);
      }, 300);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate questions"
      );
      setShowLoading(false);
      setGenerating(false);
    }
  };

  const handleSelectQuestion = (question: Question) => {
    setGameState((prev) => ({
      ...prev,
      selectedQuestion: question,
    }));
    // Delay showing the question UI to allow grid scale-down animation
    setTimeout(() => {
      setShowQuestion(true);
    }, 300);
  };

  const handleQuestionComplete = (result: QuestionResult) => {
    const { selectedQuestion, players, currentPlayerIndex } = gameState;
    if (!selectedQuestion) return;

    let updatedPlayers = [...players];
    let answeredBy: string | undefined;
    let correct: boolean | undefined;

    if (result.type === "answered") {
      // Someone answered - update their score
      const pointChange = result.correct
        ? selectedQuestion.points
        : -selectedQuestion.points;
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

    // First hide the question UI with animation
    setShowQuestion(false);

    // After animation completes, update state to show grid
    // Use 350ms to ensure the 300ms CSS transition completes before unmounting
    setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        players: updatedPlayers,
        questions: updatedQuestions,
        currentPlayerIndex: nextPlayerIndex,
        selectedQuestion: null,
      }));
    }, 350);
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
    clearGameState();
    setGameState(createInitialState());
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
    <main className="min-h-screen p-4 pt-12 md:p-8 md:pt-12 relative">
      <header className="text-center mb-8 relative">
        <LogoText
          text="TrivAI"
          height={{
            base: 60,
            md: 80,
          }}
          pixelSize={1}
          pixelPulseMin={1}
          pixelPulseMax={3}
          pixelPulseSpeed={4}
        />
        <p className="mt-4 text-blue-300">Triva powered by AI</p>
        {gameState.phase === "playing" && (
          <div className="fixed bottom-4 left-4 z-20 md:absolute md:bottom-auto md:left-0 md:top-1/2 md:-translate-y-1/2">
            <KeyboardButton
              onClick={() => setShowMenuConfirm(true)}
              theme="primary"
              fontSize="0.75rem"
            >
              Menu
            </KeyboardButton>
          </div>
        )}
      </header>

      {error && (
        <div className="max-w-md mx-auto mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}


      {gameState.phase === "menu" && (
        <div className="max-w-lg mx-auto text-center">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Welcome to TrivAI!</h2>
            <p className="text-blue-200 mb-8">
              A Jeopardy-style trivia game where AI generates questions and
              judges your answers.
            </p>
            <KeyboardButton
              onClick={handleStartGame}
              theme="primary"
              className="w-full"
            >
              Start New Game
            </KeyboardButton>
            {process.env.NEXT_PUBLIC_DEV_MODE === "1" && (
              <KeyboardButton
                onClick={handleStartDevGame}
                theme="gray-dark"
                className="w-full mt-3"
              >
                Start Demo Game
              </KeyboardButton>
            )}
          </div>
        </div>
      )}

      {gameState.phase === "setup" && (
        <PlayerSetup
          onComplete={handlePlayersComplete}
          onBack={handleBackToMenu}
        />
      )}

      {(gameState.phase === "categories" || generating) && (
        <div className="relative">
          <div className={generating ? 'pointer-events-none' : ''}>
            <CategorySetup
              onComplete={handleCategoriesComplete}
              onBack={handleBackToPlayers}
              isHidden={generating}
            />
          </div>
          {generating && (
            <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
              <div
                className="text-center transition-all duration-300 ease-in-out origin-center"
                style={{
                  transform: showLoading ? 'scale(1)' : 'scale(0)',
                  opacity: showLoading ? 1 : 0,
                }}
              >
                <LoadingIndicator />
                <p className="text-lg mt-64 font-semibold text-white">
                  Generating questions...
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {gameState.phase === "playing" && (
        <div className="relative">
          {/* GameBoard - always rendered to maintain layout height */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              gameState.selectedQuestion ? 'pointer-events-none' : ''
            }`}
          >
            <GameBoard
              categories={gameState.categories}
              questions={gameState.questions}
              players={gameState.players}
              currentPlayerIndex={gameState.currentPlayerIndex}
              onSelectQuestion={handleSelectQuestion}
              isHidden={!!gameState.selectedQuestion}
            />
          </div>
          {/* QuestionModal - absolutely positioned to overlay */}
          {gameState.selectedQuestion && getSelectedCategory() && (
            <div className="absolute inset-0 flex items-center justify-center">
              <QuestionModal
                question={gameState.selectedQuestion}
                category={getSelectedCategory()!}
                players={gameState.players}
                currentPlayerIndex={gameState.currentPlayerIndex}
                onComplete={handleQuestionComplete}
                onRegenerate={handleQuestionRegenerate}
                isVisible={showQuestion}
              />
            </div>
          )}
        </div>
      )}

      {/* Audio Controls */}
      <AudioControls currentTrack={currentTrack} />

      {/* Debug Menu (only in dev mode) */}
      <DebugMenu gameState={gameState} onUpdateGameState={setGameState} />

      {/* Menu Confirmation Modal */}
      {showMenuConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 md:p-8">
          <KeyboardContainer
            className="!w-[600px] !max-w-full"
            theme="modal"
          >
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-4">End Current Game?</h3>
              <p className="text-blue-200 mb-6">
                Returning to the menu will end your current game. This cannot be undone.
              </p>
              <div className="flex gap-4 justify-center">
                <KeyboardButton
                  onClick={() => setShowMenuConfirm(false)}
                  theme="primary"
                >
                  No, Continue
                </KeyboardButton>
                <KeyboardButton
                  onClick={() => {
                    setShowMenuConfirm(false);
                    handleNewGame();
                  }}
                  theme="destructive"
                >
                  Yes, End Game
                </KeyboardButton>
              </div>
            </div>
          </KeyboardContainer>
        </div>
      )}
    </main>
  );
}
