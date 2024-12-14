import { create } from 'zustand';
import { PlayerState, GameStats, StoryContext } from '../types/game';
import { getInitialStats } from '../utils/story-utils';

interface GameState {
  currentChapter: number;
  currentStep: number;
  player: PlayerState;
  isLoading: boolean;
  combatHistory: string[];
  setChapter: (chapter: number) => void;
  setStep: (step: number) => void;
  addChoice: (choice: string, outcome: string) => void;
  setPlayerName: (name: string) => void;
  updateStats: (stats: Partial<GameStats>) => void;
  addCombatEvent: (event: string) => void;
  setLoading: (loading: boolean) => void;
  resetGame: () => void;
  getStoryContext: () => StoryContext;
}

const initialPlayerState: PlayerState = {
  name: '',
  stats: getInitialStats(),
  choices: [],
};

export const useGameStore = create<GameState>((set, get) => ({
  currentChapter: 1,
  currentStep: 1,
  player: initialPlayerState,
  isLoading: false,
  combatHistory: [],
  
  setChapter: (chapter) => set({ currentChapter: chapter }),
  setStep: (step) => set({ currentStep: step }),
  
  addChoice: (choice, outcome) => set((state) => ({
    player: {
      ...state.player,
      choices: [...state.player.choices, {
        chapter: state.currentChapter,
        step: state.currentStep,
        choice,
        outcome
      }],
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
  
  addCombatEvent: (event) => set((state) => ({
    combatHistory: [...state.combatHistory, event]
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  resetGame: () => set({
    currentChapter: 1,
    currentStep: 1,
    player: initialPlayerState,
    isLoading: false,
    combatHistory: [],
  }),
  
  getStoryContext: () => {
    const state = get();
    return {
      currentChapter: state.currentChapter,
      currentStep: state.currentStep,
      playerChoices: state.player.choices.map(c => `${c.choice} - ${c.outcome}`),
      playerStats: state.player.stats,
      combatHistory: state.combatHistory,
    };
  },
}));