"use client";

import { useState } from "react";
import { Question, Player, Category } from "@/types/game";
import { audioManager } from "@/lib/audio";
import { RaisedTextButton } from "@/components/RaisedTextButton";
import { KeyboardButton } from "@/components/KeyboardButton";

interface QuestionModalProps {
  question: Question;
  category: Category;
  players: Player[];
  currentPlayerIndex: number;
  onComplete: (result: QuestionResult) => void;
  onRegenerate: (newQuestion: string, newAnswer: string) => void;
}

export type QuestionResult =
  | { type: "answered"; correct: boolean; playerIndex: number }
  | { type: "skipped" }; // Everyone passed, no points awarded

type ModalPhase = "question" | "selecting" | "evaluating" | "judging" | "result" | "regenerating" | "revealed";

interface EvaluationResult {
  correct: boolean;
  explanation: string;
  confidence: string;
  correctAnswer: string;
}

export function QuestionModal({
  question,
  category,
  players,
  currentPlayerIndex,
  onComplete,
  onRegenerate,
}: QuestionModalProps) {
  const [phase, setPhase] = useState<ModalPhase>("question");
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(question.question);
  const [currentAnswer, setCurrentAnswer] = useState(question.answer);

  // Track which players have passed (for "don't know" feature)
  const [passedPlayerIndices, setPassedPlayerIndices] = useState<number[]>([]);
  const [answeringPlayerIndex, setAnsweringPlayerIndex] = useState(currentPlayerIndex);

  // Track the final result for display
  const [finalResult, setFinalResult] = useState<{ correct: boolean; playerIndex: number } | null>(null);

  const currentPlayer = players[answeringPlayerIndex];

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      setError("Please enter an answer");
      return;
    }

    setPhase("evaluating");
    setError("");

    try {
      const response = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion,
          correctAnswer: currentAnswer,
          userAnswer: userAnswer.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to evaluate answer");
      }

      setEvaluation(data);
      setPhase("judging");

      // Play AI evaluation sound and pause music until returning to board
      if (data.correct) {
        audioManager.playSfxAndPauseMusic("correct");
      } else {
        audioManager.playSfxAndPauseMusic("incorrect");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to evaluate answer");
      setPhase("question");
    }
  };

  const handleModeratorDecision = (correct: boolean) => {
    // Play sound immediately on button press
    if (correct) {
      audioManager.playSfx("points-gain");
    } else {
      audioManager.playSfx("points-lose");
    }

    setFinalResult({ correct, playerIndex: answeringPlayerIndex });
    setPhase("result");
    setTimeout(() => {
      onComplete({ type: "answered", correct, playerIndex: answeringPlayerIndex });
    }, 2000);
  };

  const handleDontKnow = () => {
    const newPassedIndices = [...passedPlayerIndices, answeringPlayerIndex];
    setPassedPlayerIndices(newPassedIndices);

    // Find remaining players who haven't passed
    const remainingPlayers = players.filter((_, i) => !newPassedIndices.includes(i));

    if (remainingPlayers.length === 0) {
      // Everyone has passed - reveal answer, no points awarded
      audioManager.playSfxAndPauseMusic("nobody-knows");
      setPhase("revealed");
    } else if (players.length > 2) {
      // More than 2 players - show selection screen
      setPhase("selecting");
    } else {
      // Only 2 players - auto-select the other player
      const nextIndex = newPassedIndices.includes(0) ? 1 : 0;
      setAnsweringPlayerIndex(nextIndex);
      setUserAnswer("");
      setError("");
    }
  };

  const handleSelectPlayer = (playerIndex: number) => {
    setAnsweringPlayerIndex(playerIndex);
    setUserAnswer("");
    setError("");
    setPhase("question");
  };

  const handleNobodyWantsToAnswer = () => {
    audioManager.playSfxAndPauseMusic("nobody-knows");
    setPhase("revealed");
  };

  const handleRevealedContinue = () => {
    onComplete({ type: "skipped" });
  };

  const handleRegenerate = async () => {
    setPhase("regenerating");
    setError("");

    try {
      const response = await fetch("/api/regenerate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: category.name,
          difficulty: question.difficulty,
          points: question.points,
          oldQuestion: currentQuestion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to regenerate question");
      }

      setCurrentQuestion(data.question);
      setCurrentAnswer(data.answer);
      onRegenerate(data.question, data.answer);
      setUserAnswer("");
      setPassedPlayerIndices([]);
      setAnsweringPlayerIndex(currentPlayerIndex);
      setPhase("question");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate question");
      setPhase("question");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-blue-600 font-bold">${question.points}</span>
          <span className="text-gray-600">{currentPlayer.name}&apos;s turn</span>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {currentQuestion}
          </h3>
          {passedPlayerIndices.length > 0 && phase === "question" && (
            <p className="text-sm text-gray-500">
              Passed: {passedPlayerIndices.map(i => players[i].name).join(", ")}
            </p>
          )}
        </div>

        {/* Answer Input Phase */}
        {phase === "question" && (
          <div>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitAnswer()}
              placeholder="Type your answer..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-lg"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="flex gap-2 mt-4 items-center">
              <RaisedTextButton
                onClick={submitAnswer}
                className="flex-1"
              >
                Submit Answer
              </RaisedTextButton>
              <KeyboardButton
                onClick={handleDontKnow}
                bgColor="#e5e7eb"
                hoverBgColor="#d1d5db"
                borderColor="#9ca3af"
                shadowBgColor="#d1d5db"
                shadowColor="#9ca3af"
                textColor="#374151"
              >
                Don&apos;t Know
              </KeyboardButton>
            </div>
            <KeyboardButton
              onClick={handleRegenerate}
              bgColor="#f3f4f6"
              hoverBgColor="#e5e7eb"
              borderColor="#d1d5db"
              shadowBgColor="#e5e7eb"
              shadowColor="#d1d5db"
              textColor="#6b7280"
              fontSize="0.75rem"
              className="w-full mt-2"
            >
              Regenerate Question
            </KeyboardButton>
          </div>
        )}

        {/* Player Selection Phase (3+ players) */}
        {phase === "selecting" && (
          <div>
            <p className="text-center text-gray-700 mb-4">
              {currentPlayer.name} doesn&apos;t know. Who wants to answer?
            </p>
            {passedPlayerIndices.length > 0 && (
              <p className="text-sm text-gray-500 text-center mb-4">
                Passed: {passedPlayerIndices.map(i => players[i].name).join(", ")}
              </p>
            )}
            <div className="space-y-2">
              {players.map((player, index) => {
                const hasPassed = passedPlayerIndices.includes(index);
                if (hasPassed) return null;
                return (
                  <KeyboardButton
                    key={player.id}
                    onClick={() => handleSelectPlayer(index)}
                    bgColor="#3b82f6"
                    hoverBgColor="#2563eb"
                    borderColor="#1d4ed8"
                    shadowBgColor="#1e40af"
                    shadowColor="#1e3a8a"
                    textColor="#ffffff"
                    className="w-full"
                  >
                    {player.name}
                  </KeyboardButton>
                );
              })}
              <KeyboardButton
                onClick={handleNobodyWantsToAnswer}
                bgColor="#e5e7eb"
                hoverBgColor="#d1d5db"
                borderColor="#9ca3af"
                shadowBgColor="#d1d5db"
                shadowColor="#9ca3af"
                textColor="#374151"
                className="w-full"
              >
                Nobody Knows
              </KeyboardButton>
            </div>
          </div>
        )}

        {/* Regenerating Phase */}
        {phase === "regenerating" && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating a new question...</p>
          </div>
        )}

        {/* Evaluating Phase */}
        {phase === "evaluating" && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">AI is evaluating the answer...</p>
          </div>
        )}

        {/* Moderator Judging Phase */}
        {phase === "judging" && evaluation && (
          <div>
            <div className="mb-4 p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-900">
                <strong>{currentPlayer.name}&apos;s Answer:</strong> {userAnswer}
              </p>
              <p className="text-gray-900 mt-2">
                <strong>Correct Answer:</strong> {evaluation.correctAnswer}
              </p>
            </div>

            <div
              className={`mb-4 p-4 rounded-lg ${
                evaluation.correct ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <p className="font-semibold mb-2">
                AI Says:{" "}
                <span className={evaluation.correct ? "text-green-700" : "text-red-700"}>
                  {evaluation.correct ? "CORRECT" : "INCORRECT"}
                </span>
                <span className="text-gray-500 text-sm ml-2">
                  (Confidence: {evaluation.confidence})
                </span>
              </p>
              <p className="text-gray-700">{evaluation.explanation}</p>
            </div>

            <div className="border-t pt-4">
              <p className="text-center text-gray-900 font-semibold mb-4">
                Moderator: Was {currentPlayer.name}&apos;s answer correct?
              </p>
              <div className="flex gap-4 items-center">
                <RaisedTextButton
                  onClick={() => handleModeratorDecision(true)}
                  className="flex-1"
                >
                  Yes, Correct (+${question.points})
                </RaisedTextButton>
                <RaisedTextButton
                  onClick={() => handleModeratorDecision(false)}
                  className="flex-1"
                >
                  No, Incorrect (-${question.points})
                </RaisedTextButton>
              </div>
            </div>
          </div>
        )}

        {/* Result Phase */}
        {phase === "result" && finalResult && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-2">{players[finalResult.playerIndex].name}</p>
            <div
              className={`text-4xl mb-4 ${
                finalResult.correct ? "text-green-600" : "text-red-600"
              }`}
            >
              {finalResult.correct ? "+" : "-"}${question.points}
            </div>
            <p className="text-gray-600">Moving to next player...</p>
          </div>
        )}

        {/* Revealed Phase (everyone passed) */}
        {phase === "revealed" && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Nobody knew the answer!</p>
            <div className="p-4 bg-blue-100 rounded-lg mb-6">
              <p className="text-gray-900">
                <strong>The correct answer was:</strong>
              </p>
              <p className="text-2xl text-blue-800 font-semibold mt-2">
                {currentAnswer}
              </p>
            </div>
            <p className="text-gray-500 mb-4">No points awarded or deducted</p>
            <RaisedTextButton
              onClick={handleRevealedContinue}
            >
              Continue
            </RaisedTextButton>
          </div>
        )}
      </div>
    </div>
  );
}
