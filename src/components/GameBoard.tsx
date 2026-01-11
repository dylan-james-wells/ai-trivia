"use client";

import { useRef, useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { Category, Question, Player, POINTS_PER_DIFFICULTY } from "@/types/game";
import { KeyboardButton } from "@/components/KeyboardButton";
import { KeyboardContainer } from "@/components/KeyboardContainer";

interface CategoryHeaderProps {
  category: Category;
  index: number;
}

function CategoryHeader({ category, index }: CategoryHeaderProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const tooltipId = `category-tooltip-${index}`;

  useEffect(() => {
    const checkOverflow = () => {
      const el = textRef.current;
      if (el) {
        setIsOverflowing(el.scrollWidth > el.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [category.name]);

  return (
    <KeyboardContainer
      className="category-header"
      bgColor="#1e40af"
      borderColor="#1e3a8a"
      shadowBgColor="#1e3a8a"
    >
      <span
        ref={textRef}
        className="category-header-text text-white font-bold text-sm text-center w-full"
        data-tooltip-id={isOverflowing ? tooltipId : undefined}
        data-tooltip-content={category.name}
      >
        {category.name}
      </span>
      {isOverflowing && (
        <Tooltip id={tooltipId} place="top" />
      )}
    </KeyboardContainer>
  );
}

interface GameBoardProps {
  categories: Category[];
  questions: Question[];
  players: Player[];
  currentPlayerIndex: number;
  onSelectQuestion: (question: Question) => void;
}

export function GameBoard({
  categories,
  questions,
  players,
  currentPlayerIndex,
  onSelectQuestion,
}: GameBoardProps) {
  const currentPlayer = players[currentPlayerIndex];

  const getQuestion = (categoryIndex: number, difficulty: number) => {
    return questions.find(
      (q) => q.categoryIndex === categoryIndex && q.difficulty === difficulty
    );
  };

  const allQuestionsAnswered = questions.every((q) => q.answered);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Scoreboard */}
      <div className="mb-6 flex flex-wrap gap-4 justify-center">
        {players.map((player, index) => (
          <div
            key={player.id}
            className={`px-4 py-2 rounded-lg ${
              index === currentPlayerIndex
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            <span className="font-semibold">{player.name}</span>
            <span className="ml-2">${player.score}</span>
          </div>
        ))}
      </div>

      {!allQuestionsAnswered && (
        <p className="text-center mb-4 text-lg">
          <span className="font-semibold">{currentPlayer.name}</span>, select a question!
        </p>
      )}

      {allQuestionsAnswered && (
        <div className="text-center mb-4 p-4 bg-green-100 rounded-lg">
          <h2 className="text-2xl font-bold text-green-800">Game Over!</h2>
          <p className="text-green-700">
            Winner:{" "}
            {players.reduce((a, b) => (a.score > b.score ? a : b)).name}
          </p>
        </div>
      )}

      {/* Game Board Grid */}
      <div className="grid grid-cols-6 gap-2 md:gap-4">
        {/* Category Headers */}
        {categories.map((category, index) => (
          <CategoryHeader key={index} category={category} index={index} />
        ))}

        {/* Question Cells */}
        {POINTS_PER_DIFFICULTY.map((points, difficultyIndex) => (
          categories.map((_, categoryIndex) => {
            const question = getQuestion(categoryIndex, difficultyIndex + 1);
            const isAnswered = question?.answered;

            return (
              <KeyboardButton
                key={`${categoryIndex}-${difficultyIndex}`}
                onClick={() => question && !isAnswered && onSelectQuestion(question)}
                disabled={isAnswered || !question}
                bgColor={isAnswered ? "#1e3a5f" : "#3b82f6"}
                hoverBgColor={isAnswered ? "#1e3a5f" : "#2563eb"}
                borderColor={isAnswered ? "#172d4d" : "#1d4ed8"}
                shadowBgColor={isAnswered ? "#172d4d" : "#1e40af"}
                textColor={isAnswered ? "#3b5998" : "#fde047"}
                fontSize="1.25rem"
                className="w-full question-cell"
              >
                {isAnswered ? "" : `$${points}`}
              </KeyboardButton>
            );
          })
        ))}
      </div>
    </div>
  );
}
