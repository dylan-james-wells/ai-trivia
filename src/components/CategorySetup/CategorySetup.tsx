"use client";

import { useState } from "react";
import { Category, TOTAL_CATEGORIES } from "@/types/game";
import { KeyboardButton } from "@/components/KeyboardButton";
import { KeyboardInput } from "@/components/KeyboardInput";
import { KeyboardContainer } from "@/components/KeyboardContainer";

interface CategorySetupProps {
  onComplete: (categories: Category[]) => void;
  onBack: () => void;
  isHidden?: boolean;
}

export function CategorySetup({ onComplete, onBack, isHidden = false }: CategorySetupProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState("");
  const [pendingCategory, setPendingCategory] = useState<{
    name: string;
    interpretation: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [error, setError] = useState("");

  const validateCategory = async () => {
    const name = currentCategory.trim();
    if (!name) {
      setError("Please enter a category");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/validate-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to validate category");
      }

      if (!data.valid) {
        setError(data.reason || "This doesn't appear to be a valid trivia category");
        return;
      }

      setPendingCategory({
        name,
        interpretation: data.interpretation,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to validate category");
    } finally {
      setLoading(false);
    }
  };

  const confirmCategory = () => {
    if (!pendingCategory) return;

    setCategories([
      ...categories,
      {
        name: pendingCategory.name,
        confirmed: true,
        aiInterpretation: pendingCategory.interpretation,
      },
    ]);
    setCurrentCategory("");
    setPendingCategory(null);
  };

  const rejectCategory = () => {
    setPendingCategory(null);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    if (categories.length !== TOTAL_CATEGORIES) {
      setError(`Please select exactly ${TOTAL_CATEGORIES} categories`);
      return;
    }
    onComplete(categories);
  };

  const handleAutoSuggest = async () => {
    setAutoLoading(true);
    setError("");

    try {
      const response = await fetch("/api/suggest-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ existingCategories: categories }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to suggest categories");
      }

      const newCategories = data.categories.map((c: { name: string; interpretation: string }) => ({
        name: c.name,
        confirmed: true,
        aiInterpretation: c.interpretation,
      }));

      setCategories([...categories, ...newCategories]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to suggest categories");
    } finally {
      setAutoLoading(false);
    }
  };

  return (
    <div
      className="max-w-2xl mx-auto transition-all duration-300 ease-in-out origin-center"
      style={{
        transform: isHidden ? 'scale(0)' : 'scale(1)',
        opacity: isHidden ? 0 : 1,
      }}
    >
      <h2 className="text-2xl font-bold mb-6 text-center">
        Select {TOTAL_CATEGORIES} Categories
      </h2>

      {categories.length < TOTAL_CATEGORIES && !pendingCategory && (
        <div className="mb-8">
          <div className="flex gap-2 items-start">
            <KeyboardInput
              type="text"
              value={currentCategory}
              onChange={(e) => setCurrentCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && validateCategory()}
              placeholder="Enter a trivia category (e.g., 'World History', '90s Movies')"
              maxLength={100}
              disabled={loading}
              className="flex-1"
            />
            <KeyboardButton
              onClick={validateCategory}
              disabled={loading || autoLoading}
              bgColor="var(--color-primary)"
              hoverBgColor="var(--color-primary-hover)"
              borderColor="var(--color-primary-border)"
              shadowBgColor="var(--color-primary-shadow)"
              textColor="var(--color-text-white)"
            >
              {loading ? "Checking..." : "Add"}
            </KeyboardButton>
            <KeyboardButton
              onClick={handleAutoSuggest}
              disabled={loading || autoLoading}
              bgColor="var(--color-success)"
              hoverBgColor="var(--color-success-hover)"
              borderColor="var(--color-success-border)"
              shadowBgColor="var(--color-success-hover)"
              textColor="var(--color-text-white)"
            >
              {autoLoading ? "..." : "Auto"}
            </KeyboardButton>
          </div>
          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </div>
      )}

      {pendingCategory && (
        <div className="mb-8">
          <KeyboardContainer>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Confirm Category</h3>
              <p className="text-gray-900 mb-1">
                <strong>You entered:</strong> {pendingCategory.name}
              </p>
              <p className="text-gray-700 mb-3">
                <strong>AI interpretation:</strong> {pendingCategory.interpretation}
              </p>
              <div className="flex gap-2">
                <KeyboardButton
                  onClick={confirmCategory}
                  bgColor="var(--color-success)"
                  hoverBgColor="var(--color-success-hover)"
                  borderColor="var(--color-success-border)"
                  shadowBgColor="var(--color-success-hover)"
                  textColor="var(--color-text-white)"
                >
                  Confirm
                </KeyboardButton>
                <KeyboardButton
                  onClick={rejectCategory}
                  bgColor="var(--color-primary)"
                  hoverBgColor="var(--color-primary-hover)"
                  borderColor="var(--color-primary-border)"
                  shadowBgColor="var(--color-primary-shadow)"
                  textColor="var(--color-text-white)"
                >
                  Try Again
                </KeyboardButton>
              </div>
            </div>
          </KeyboardContainer>
        </div>
      )}

      {categories.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold mb-2">
            Categories ({categories.length}/{TOTAL_CATEGORIES}):
          </h3>
          <ul className="space-y-2">
            {categories.map((category, index) => (
              <li key={index} className="mb-6">
                <KeyboardContainer className="category">
                  <div>
                    <span className="font-medium text-gray-900">{category.name}</span>
                    {category.aiInterpretation && (
                      <p className="text-sm text-gray-600">{category.aiInterpretation}</p>
                    )}
                  </div>
                  <KeyboardButton
                    onClick={() => removeCategory(index)}
                    bgColor="var(--color-destructive-bg)"
                    hoverBgColor="var(--color-destructive-hover)"
                    borderColor="var(--color-destructive)"
                    shadowBgColor="var(--color-destructive-shadow)"
                    textColor="var(--color-destructive)"
                    fontSize="0.75rem"
                  >
                    Remove
                  </KeyboardButton>
                </KeyboardContainer>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-4 items-center">
        <KeyboardButton
          onClick={onBack}
          bgColor="var(--color-gray-100)"
          hoverBgColor="var(--color-gray-200)"
          borderColor="var(--color-gray-300)"
          shadowBgColor="var(--color-gray-200)"
          textColor="var(--color-gray-700)"
        >
          Back
        </KeyboardButton>
        {categories.length === TOTAL_CATEGORIES ? (
          <KeyboardButton
            onClick={handleComplete}
            bgColor="var(--color-primary)"
            hoverBgColor="var(--color-primary-hover)"
            borderColor="var(--color-primary-border)"
            shadowBgColor="var(--color-primary-shadow)"
            textColor="var(--color-text-white)"
            className="flex-1"
          >
            Generate Questions
          </KeyboardButton>
        ) : (
          <span className="flex-1 text-center text-gray-400 text-lg uppercase font-semibold">
            Generate Questions ({categories.length}/{TOTAL_CATEGORIES})
          </span>
        )}
      </div>
    </div>
  );
}
