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
    <KeyboardButton
      disabled
      bgColor="#5090d0"
      hoverBgColor="#5090d0"
      borderColor="#4080c0"
      shadowBgColor="#3070b0"
      textColor="#ffffff"
      fontSize="1.25rem"
      className="w-full question-cell category-header-btn"
    >
      <span
        ref={textRef}
        className="category-header-text"
        data-tooltip-id={isOverflowing ? "category-tooltip" : undefined}
        data-tooltip-content={isOverflowing ? category.name : undefined}
      >
        {category.name}
      </span>
    </KeyboardButton>
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
                ? "text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            style={index === currentPlayerIndex ? { backgroundColor: "#22c55e" } : undefined}
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

      {allQuestionsAnswered && (() => {
        const highScore = Math.max(...players.map(p => p.score));
        const winners = players.filter(p => p.score === highScore);
        const isTie = winners.length === players.length;

        let title: string;
        let subtitle: string;
        let bgColor: string;
        let borderColor: string;
        let shadowBgColor: string;
        let textColor: string;

        if (isTie) {
          if (highScore === 0) {
            // Everybody has 0
            title = "Nobody Wins!";
            subtitle = "Everyone finished with $0";
            bgColor = "#fef3c7";
            borderColor = "#f59e0b";
            shadowBgColor = "#fcd34d";
            textColor = "#92400e";
          } else if (highScore < 0) {
            // Everybody has negative
            title = "Everybody Loses!";
            subtitle = `Everyone finished with $${highScore}`;
            bgColor = "#fee2e2";
            borderColor = "#ef4444";
            shadowBgColor = "#fca5a5";
            textColor = "#991b1b";
          } else {
            // Everybody has positive equal score
            title = "Everybody Wins!";
            subtitle = `Everyone finished with $${highScore}`;
            bgColor = "#d1fae5";
            borderColor = "#10b981";
            shadowBgColor = "#6ee7b7";
            textColor = "#065f46";
          }
        } else if (winners.length > 1) {
          // Multiple winners (tie for first, but not everyone)
          title = "It's a Tie!";
          subtitle = `Winners: ${winners.map(w => w.name).join(" & ")} with $${highScore}`;
          bgColor = "#d1fae5";
          borderColor = "#10b981";
          shadowBgColor = "#6ee7b7";
          textColor = "#065f46";
        } else {
          // Single winner
          title = "Game Over!";
          subtitle = `Winner: ${winners[0].name} with $${highScore}`;
          bgColor = "#d1fae5";
          borderColor = "#10b981";
          shadowBgColor = "#6ee7b7";
          textColor = "#065f46";
        }

        return (
          <KeyboardContainer
            className="mb-8"
            bgColor={bgColor}
            borderColor={borderColor}
            shadowBgColor={shadowBgColor}
          >
            <div className="text-center p-2 w-full">
              <h2 className="text-2xl font-bold" style={{ color: textColor }}>{title}</h2>
              <p style={{ color: textColor }}>{subtitle}</p>
            </div>
          </KeyboardContainer>
        );
      })()}

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
