"use client";

import { useState } from "react";
import { Question, Player } from "@/types/game";

interface QuestionModalProps {
  question: Question;
  currentPlayer: Player;
  onComplete: (correct: boolean) => void;
  onClose: () => void;
}

type ModalPhase = "question" | "evaluating" | "judging" | "result";

interface EvaluationResult {
  correct: boolean;
  explanation: string;
  confidence: string;
  correctAnswer: string;
}

export function QuestionModal({
  question,
  currentPlayer,
  onComplete,
  onClose,
}: QuestionModalProps) {
  const [phase, setPhase] = useState<ModalPhase>("question");
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState("");

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
          question: question.question,
          correctAnswer: question.answer,
          userAnswer: userAnswer.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to evaluate answer");
      }

      setEvaluation(data);
      setPhase("judging");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to evaluate answer");
      setPhase("question");
    }
  };

  const handleModeratorDecision = (correct: boolean) => {
    setPhase("result");
    setTimeout(() => {
      onComplete(correct);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-blue-600 font-bold">${question.points}</span>
          <span className="text-gray-600">{currentPlayer.name}&apos;s turn</span>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            &times;
          </button>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {question.question}
          </h3>
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
            <button
              onClick={submitAnswer}
              className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Answer
            </button>
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
                <strong>Player&apos;s Answer:</strong> {userAnswer}
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
              <p className="text-center text-gray-600 mb-4">
                <strong>Moderator:</strong> Do you accept this judgment?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleModeratorDecision(true)}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Correct
                </button>
                <button
                  onClick={() => handleModeratorDecision(false)}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Incorrect
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Result Phase */}
        {phase === "result" && (
          <div className="text-center py-8">
            <div
              className={`text-4xl mb-4 ${
                evaluation?.correct ? "text-green-600" : "text-red-600"
              }`}
            >
              {evaluation?.correct ? "+" : "-"}${question.points}
            </div>
            <p className="text-gray-600">Moving to next player...</p>
          </div>
        )}
      </div>
    </div>
  );
}
