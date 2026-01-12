"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Tooltip } from "react-tooltip";
import { Category, Question, Player, POINTS_PER_DIFFICULTY } from "@/types/game";
import { KeyboardButton } from "@/components/KeyboardButton";
import { KeyboardContainer } from "@/components/KeyboardContainer";
import "./GameBoard.css";

interface CategoryHeaderProps {
  category: Category;
  index: number;
  isOverflowing: boolean;
  onOverflowChange: (index: number, isOverflowing: boolean) => void;
}

function CategoryHeader({ category, index, isOverflowing, onOverflowChange }: CategoryHeaderProps) {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      const el = textRef.current;
      if (el) {
        onOverflowChange(index, el.scrollWidth > el.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [category.name, index, onOverflowChange]);

  return (
    <KeyboardContainer
      className="category-header"
      bgColor="#5090d0"
      borderColor="#4080c0"
      shadowBgColor="#3070b0"
    >
      <span
        ref={textRef}
        className="category-header-text text-white font-bold text-sm text-center w-full"
        data-tooltip-id={isOverflowing ? "category-tooltip" : undefined}
        data-tooltip-content={isOverflowing ? category.name : undefined}
      >
        {category.name}
      </span>
    </KeyboardContainer>
  );
}

interface GameBoardProps {
  categories: Category[];
  questions: Question[];
  players: Player[];
  currentPlayerIndex: number;
  onSelectQuestion: (question: Question) => void;
  isHidden?: boolean;
}

export function GameBoard({
  categories,
  questions,
  players,
  currentPlayerIndex,
  onSelectQuestion,
  isHidden = false,
}: GameBoardProps) {
  const currentPlayer = players[currentPlayerIndex];
  const [overflowingCategories, setOverflowingCategories] = useState<Set<number>>(new Set());

  const handleOverflowChange = useCallback((index: number, isOverflowing: boolean) => {
    setOverflowingCategories(prev => {
      const next = new Set(prev);
      if (isOverflowing) {
        next.add(index);
      } else {
        next.delete(index);
      }
      return next;
    });
  }, []);

  const getQuestion = (categoryIndex: number, difficulty: number) => {
    return questions.find(
      (q) => q.categoryIndex === categoryIndex && q.difficulty === difficulty
    );
  };

  const allQuestionsAnswered = questions.every((q) => q.answered);

  return (
    <div
      className="max-w-6xl mx-auto transition-all duration-300 ease-in-out origin-center"
      style={{
        transform: isHidden ? 'scale(0)' : 'scale(1)',
        opacity: isHidden ? 0 : 1,
      }}
    >
      {overflowingCategories.size > 0 && (
        <Tooltip id="category-tooltip" place="top" positionStrategy="fixed" />
      )}
      {/* Scoreboard */}
      <div className="mb-6 flex flex-wrap gap-4 justify-center">
        {players.map((player, index) => (
          <div
            key={player.id}
            className={`px-4 py-2 rounded-lg ${
              index === currentPlayerIndex
                ? "bg-green-500 text-white"
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
          <CategoryHeader
            key={index}
            category={category}
            index={index}
            isOverflowing={overflowingCategories.has(index)}
            onOverflowChange={handleOverflowChange}
          />
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
                bgColor={isAnswered ? "#1e3a5f" : "#70c0ff"}
                hoverBgColor={isAnswered ? "#1e3a5f" : "#5090d0"}
                borderColor={isAnswered ? "#172d4d" : "#4080c0"}
                shadowBgColor={isAnswered ? "#172d4d" : "#3070b0"}
                textColor={isAnswered ? "#3b5998" : "#1e3a5f"}
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
