"use client";

import { useState } from "react";
import { Category, TOTAL_CATEGORIES } from "@/types/game";
import { KeyboardButton } from "@/components/KeyboardButton";
import { KeyboardInput } from "@/components/KeyboardInput";

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
              disabled={loading}
              bgColor="#3b82f6"
              hoverBgColor="#2563eb"
              borderColor="#1d4ed8"
              shadowBgColor="#1e40af"
              shadowColor="#1e3a8a"
              textColor="#ffffff"
            >
              {loading ? "Checking..." : "Add"}
            </KeyboardButton>
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
            <KeyboardButton
              onClick={confirmCategory}
              bgColor="#22c55e"
              hoverBgColor="#16a34a"
              borderColor="#15803d"
              shadowBgColor="#16a34a"
              shadowColor="#14532d"
              textColor="#ffffff"
            >
              Confirm
            </KeyboardButton>
            <KeyboardButton
              onClick={rejectCategory}
              bgColor="#ef4444"
              hoverBgColor="#dc2626"
              borderColor="#b91c1c"
              shadowBgColor="#dc2626"
              shadowColor="#991b1b"
              textColor="#ffffff"
            >
              Try Again
            </KeyboardButton>
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
                <KeyboardButton
                  onClick={() => removeCategory(index)}
                  bgColor="#fee2e2"
                  hoverBgColor="#fecaca"
                  borderColor="#dc2626"
                  shadowBgColor="#fca5a5"
                  shadowColor="#f87171"
                  textColor="#dc2626"
                  fontSize="0.75rem"
                >
                  Remove
                </KeyboardButton>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-4 items-center">
        <KeyboardButton
          onClick={onBack}
          bgColor="#e5e7eb"
          hoverBgColor="#d1d5db"
          borderColor="#9ca3af"
          shadowBgColor="#d1d5db"
          shadowColor="#9ca3af"
          textColor="#374151"
        >
          Back
        </KeyboardButton>
        {categories.length === TOTAL_CATEGORIES ? (
          <KeyboardButton
            onClick={handleComplete}
            bgColor="#facc15"
            hoverBgColor="#eab308"
            borderColor="#ca8a04"
            shadowBgColor="#eab308"
            textColor="#422006"
            shadowOpacity={0.1}
            shadowColor="black"
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
