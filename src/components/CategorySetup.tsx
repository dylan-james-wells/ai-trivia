"use client";

import { useState } from "react";
import { Category, TOTAL_CATEGORIES } from "@/types/game";
import { RaisedTextButton } from "@/components/RaisedTextButton";

interface CategorySetupProps {
  onComplete: (categories: Category[]) => void;
  onBack: () => void;
}

export function CategorySetup({ onComplete, onBack }: CategorySetupProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState("");
  const [pendingCategory, setPendingCategory] = useState<{
    name: string;
    interpretation: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Select {TOTAL_CATEGORIES} Categories
      </h2>

      {categories.length < TOTAL_CATEGORIES && !pendingCategory && (
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={currentCategory}
              onChange={(e) => setCurrentCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && validateCategory()}
              placeholder="Enter a trivia category (e.g., 'World History', '90s Movies')"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              maxLength={100}
              disabled={loading}
            />
            <button
              onClick={validateCategory}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? "Checking..." : "Add"}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      )}

      {pendingCategory && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Confirm Category</h3>
          <p className="text-gray-900 mb-2">
            <strong>You entered:</strong> {pendingCategory.name}
          </p>
          <p className="text-gray-700 mb-4">
            <strong>AI interpretation:</strong> {pendingCategory.interpretation}
          </p>
          <div className="flex gap-2">
            <button
              onClick={confirmCategory}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Confirm
            </button>
            <button
              onClick={rejectCategory}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {categories.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">
            Categories ({categories.length}/{TOTAL_CATEGORIES}):
          </h3>
          <ul className="space-y-2">
            {categories.map((category, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded-lg"
              >
                <div>
                  <span className="font-medium text-gray-900">{category.name}</span>
                  {category.aiInterpretation && (
                    <p className="text-sm text-gray-600">{category.aiInterpretation}</p>
                  )}
                </div>
                <button
                  onClick={() => removeCategory(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-4 items-center">
        <button
          onClick={onBack}
          className="px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Back
        </button>
        {categories.length === TOTAL_CATEGORIES ? (
          <RaisedTextButton
            onClick={handleComplete}
            className="flex-1"
            color="#22c55e"
            shadowColor="#15803d"
          >
            Generate Questions
          </RaisedTextButton>
        ) : (
          <button
            disabled
            className="flex-1 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed"
          >
            Generate Questions ({categories.length}/{TOTAL_CATEGORIES})
          </button>
        )}
      </div>
    </div>
  );
}
