"use client";

import { useState } from "react";
import { Player } from "@/types/game";

interface PlayerSetupProps {
  onComplete: (players: Player[]) => void;
}

export function PlayerSetup({ onComplete }: PlayerSetupProps) {
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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            maxLength={30}
          />
          <button
            onClick={addPlayer}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
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
                <button
                  onClick={() => removePlayer(player.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={players.length < 2}
        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Continue to Categories ({players.length}/2 minimum)
      </button>
    </div>
  );
}
