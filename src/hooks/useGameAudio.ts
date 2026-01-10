"use client";

import { useEffect, useRef } from "react";
import { audioManager, MusicTrack, SoundEffect } from "@/lib/audio";

type GamePhase = "setup" | "categories" | "playing" | "finished";

interface UseGameAudioProps {
  phase: GamePhase;
  hasSelectedQuestion: boolean;
  isGameOver: boolean;
}

export function useGameAudio({ phase, hasSelectedQuestion, isGameOver }: UseGameAudioProps) {
  const initialized = useRef(false);
  const previousHasSelectedQuestion = useRef(hasSelectedQuestion);

  // Determine which music track to play based on game state
  useEffect(() => {
    // Don't auto-play until user has interacted (handled by AudioControls)
    if (!initialized.current) return;

    // Check if we're returning to the board from a question (modal closed)
    const returningToBoard = previousHasSelectedQuestion.current && !hasSelectedQuestion;
    previousHasSelectedQuestion.current = hasSelectedQuestion;

    let track: MusicTrack = "none";

    if (phase === "setup" || phase === "categories") {
      track = "setup";
    } else if (phase === "playing") {
      if (isGameOver) {
        track = "victory";
      } else if (hasSelectedQuestion) {
        track = "question";
      } else {
        track = "board";
      }
    } else if (phase === "finished") {
      track = "victory";
    }

    // If returning to board, the music might be paused from SFX - this will resume it
    audioManager.playMusic(track);
  }, [phase, hasSelectedQuestion, isGameOver]);

  // Initialize audio manager (called when user unmutes)
  const initializeAudio = () => {
    if (!initialized.current) {
      audioManager.initialize();
      initialized.current = true;
    }
  };

  // Play sound effects
  const playCorrectSound = () => {
    initializeAudio();
    audioManager.playSfx("correct");
  };

  const playIncorrectSound = () => {
    initializeAudio();
    audioManager.playSfx("incorrect");
  };

  const playPointsGainSound = () => {
    initializeAudio();
    audioManager.playSfx("points-gain");
  };

  const playPointsLoseSound = () => {
    initializeAudio();
    audioManager.playSfx("points-lose");
  };

  const playSfx = (effect: SoundEffect) => {
    initializeAudio();
    audioManager.playSfx(effect);
  };

  // Mark as initialized when audio controls are used
  const markInitialized = () => {
    initialized.current = true;
  };

  return {
    playCorrectSound,
    playIncorrectSound,
    playPointsGainSound,
    playPointsLoseSound,
    playSfx,
    markInitialized,
  };
}
