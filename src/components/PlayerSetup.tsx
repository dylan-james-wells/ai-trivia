"use client";

import { useState } from "react";
import { Player } from "@/types/game";
import { RaisedTextButton } from "@/components/RaisedTextButton";
import { KeyboardButton } from "@/components/KeyboardButton";

interface PlayerSetupProps {
  onComplete: (players: Player[]) => void;
  onBack: () => void;
}

export function PlayerSetup({ onComplete, onBack }: PlayerSetupProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [error, setError] = useState("");

  const addPlayer = () => {
    const name = newPlayerName.trim();
    if (!name) {
      setError("Please enter a player name");
      return;
    }
    if (players.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      setError("Player name already exists");
      return;
    }
    if (players.length >= 8) {
      setError("Maximum 8 players allowed");
      return;
    }

    setPlayers([...players, { id: `player-${Date.now()}`, name, score: 0 }]);
    setNewPlayerName("");
    setError("");
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

  const handleSubmit = () => {
    if (players.length < 2) {
      setError("At least 2 players are required");
      return;
    }
    onComplete(players);
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Player Setup</h2>

      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPlayer()}
            placeholder="Enter player name"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            maxLength={30}
          />
          <KeyboardButton
            onClick={addPlayer}
            bgColor="#3b82f6"
            hoverBgColor="#2563eb"
            borderColor="#1d4ed8"
            shadowBgColor="#1e40af"
            shadowColor="#1e3a8a"
            textColor="#ffffff"
          >
            Add
          </KeyboardButton>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {players.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Players ({players.length}):</h3>
          <ul className="space-y-2">
            {players.map((player) => (
              <li
                key={player.id}
                className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded-lg"
              >
                <span className="text-gray-900">{player.name}</span>
                <KeyboardButton
                  onClick={() => removePlayer(player.id)}
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
        {players.length >= 2 ? (
          <RaisedTextButton
            onClick={handleSubmit}
            className="flex-1"
          >
            Continue
          </RaisedTextButton>
        ) : (
          <span className="flex-1 text-center text-gray-400 text-lg uppercase font-semibold">
            Continue ({players.length}/2 minimum)
          </span>
        )}
      </div>
    </div>
  );
}
