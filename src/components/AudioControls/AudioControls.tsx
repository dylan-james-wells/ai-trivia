"use client";

import { useState, useEffect } from "react";
import { audioManager, MusicTrack } from "@/lib/audio";
import { KeyboardCircleButton } from "@/components/KeyboardCircleButton";
import { KeyboardContainer } from "@/components/KeyboardContainer";
import "./AudioControls.css";

interface AudioControlsProps {
  currentTrack: MusicTrack;
}

function getInitialVolume(key: string, defaultValue: number): number {
  if (typeof window === "undefined") return defaultValue;
  const saved = localStorage.getItem(key);
  return saved !== null ? parseFloat(saved) : defaultValue;
}

export function AudioControls({ currentTrack }: AudioControlsProps) {
  const [isMuted, setIsMuted] = useState(true); // Always start muted
  const [showVolume, setShowVolume] = useState(false);
  const [musicVolume, setMusicVolume] = useState(() => getInitialVolume("audio-music-volume", 0.3));
  const [sfxVolume, setSfxVolume] = useState(() => getInitialVolume("audio-sfx-volume", 0.5));
  const [isInitialized, setIsInitialized] = useState(false);

  // Update music when track changes (only if initialized and not muted)
  useEffect(() => {
    if (isInitialized && !isMuted) {
      audioManager.playMusic(currentTrack);
    }
  }, [currentTrack, isInitialized, isMuted]);

  const handleToggleMute = () => {
    // Initialize audio on first interaction
    if (!isInitialized) {
      audioManager.initialize();
      setIsInitialized(true);
    }

    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioManager.setMuted(newMuted);

    // If unmuting, start playing the current track
    if (!newMuted) {
      audioManager.playMusic(currentTrack);
    }
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
          <div className="absolute bottom-14 right-0 mb-2">
            <KeyboardContainer
              bgColor="#70c0ff"
              borderColor="#4080c0"
              shadowBgColor="#3070b0"
            >
              <div className="p-3 min-w-[180px]">
                <div className="mb-3">
                  <label className="text-sm text-white font-semibold block mb-1">Music</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={musicVolume}
                    onChange={handleMusicVolumeChange}
                    className="audio-slider w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-white font-semibold block mb-1">Sound Effects</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={sfxVolume}
                    onChange={handleSfxVolumeChange}
                    className="audio-slider w-full"
                  />
                </div>
              </div>
            </KeyboardContainer>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-3">
          <KeyboardCircleButton
            onClick={() => setShowVolume(!showVolume)}
            title="Volume settings"
            size="2.75rem"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
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
          </KeyboardCircleButton>
          <KeyboardCircleButton
            onClick={handleToggleMute}
            title={isMuted ? "Unmute" : "Mute"}
            size="2.75rem"
          >
            {isMuted ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
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
                className="h-5 w-5 text-white"
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
          </KeyboardCircleButton>
        </div>
      </div>
    </div>
  );
}
