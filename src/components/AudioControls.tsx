"use client";

import { useState, useEffect } from "react";
import { audioManager } from "@/lib/audio";

export function AudioControls() {
  const [isMuted, setIsMuted] = useState(true);
  const [showVolume, setShowVolume] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [sfxVolume, setSfxVolume] = useState(0.5);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load saved state on mount
    const savedMuted = localStorage.getItem("audio-muted");
    const savedMusicVol = localStorage.getItem("audio-music-volume");
    const savedSfxVol = localStorage.getItem("audio-sfx-volume");

    if (savedMuted !== null) setIsMuted(savedMuted === "true");
    if (savedMusicVol !== null) setMusicVolume(parseFloat(savedMusicVol));
    if (savedSfxVol !== null) setSfxVolume(parseFloat(savedSfxVol));
  }, []);

  const handleToggleMute = () => {
    // Initialize audio on first interaction
    if (!isInitialized) {
      audioManager.initialize();
      setIsInitialized(true);
    }

    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioManager.setMuted(newMuted);
  };

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setMusicVolume(vol);
    audioManager.setMusicVolume(vol);
  };

  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setSfxVolume(vol);
    audioManager.setSfxVolume(vol);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="relative">
        {/* Volume Panel */}
        {showVolume && (
          <div className="absolute bottom-12 right-0 bg-white rounded-lg shadow-lg p-4 mb-2 min-w-[200px]">
            <div className="mb-3">
              <label className="text-sm text-gray-700 block mb-1">Music</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={musicVolume}
                onChange={handleMusicVolumeChange}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 block mb-1">Sound Effects</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={sfxVolume}
                onChange={handleSfxVolumeChange}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowVolume(!showVolume)}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            title="Volume settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
          <button
            onClick={handleToggleMute}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
