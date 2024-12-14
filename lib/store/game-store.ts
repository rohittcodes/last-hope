import { create } from 'zustand';
import { PlayerState, GameStats } from '../types/game';

interface GameState {
  currentChapter: number;
  currentStep: number;
  player: PlayerState;
  isLoading: boolean;
  setChapter: (chapter: number) => void;
  setStep: (step: number) => void;
  addChoice: (choice: string) => void;
  setPlayerName: (name: string) => void;
  updateStats: (stats: Partial<GameStats>) => void;
  setLoading: (loading: boolean) => void;
  resetGame: () => void;
}

const initialStats: GameStats = {
  power: 75,
  defense: 60,
  health: 100,
};

const initialPlayerState: PlayerState = {
  name: '',
  stats: initialStats,
  choices: [],
};

export const useGameStore = create<GameState>((set) => ({
  currentChapter: 1,
  currentStep: 1,
  player: initialPlayerState,
  isLoading: false,
  setChapter: (chapter) => set({ currentChapter: chapter }),
  setStep: (step) => set({ currentStep: step }),
  addChoice: (choice) => set((state) => ({
    player: {
      ...state.player,
      choices: [...state.player.choices, choice],
    },
  })),
  setPlayerName: (name) => set((state) => ({
    player: { ...state.player, name },
  })),
  updateStats: (stats) => set((state) => ({
    player: {
      ...state.player,
      stats: { ...state.player.stats, ...stats },
    },
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  resetGame: () => set({
    currentChapter: 1,
    currentStep: 1,
    player: initialPlayerState,
    isLoading: false,
  }),
}));