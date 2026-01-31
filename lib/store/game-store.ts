import { create } from 'zustand';
import { PlayerState, GameStats, StoryContext, Item } from '../types/game';
import { getInitialStats } from '../utils/story-utils';

interface GameState {
  currentChapter: number;
  currentStep: number;
  player: PlayerState;
  isLoading: boolean;
  combatHistory: string[];
  lastStoryDescription: string;
  setChapter: (chapter: number) => void;
  setStep: (step: number) => void;
  addChoice: (choice: string, outcome: string) => void;
  setPlayerName: (name: string) => void;
  updateStats: (stats: Partial<GameStats>) => void;
  addCombatEvent: (event: string) => void;
  setLoading: (loading: boolean) => void;
  resetGame: () => void;
  getStoryContext: () => StoryContext;
  setLastStoryDescription: (description: string) => void;
  // Inventory & Shop Actions
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  modifyCurrency: (amount: number) => void;
  canAfford: (cost: number) => boolean;
  useItem: (itemId: string) => void;
}

const initialPlayerState: PlayerState = {
  name: '',
  stats: getInitialStats(),
  choices: [],
  currency: 50, // Start with some scrap
  inventory: [
    {
      id: 'starter-medkit',
      name: 'Old Medkit',
      type: 'consumable',
      description: 'A basic first aid kit found in the shelter.',
      cost: 0,
      effect: { health: 20 }
    }
  ],
};

export const useGameStore = create<GameState>((set, get) => ({
  currentChapter: 1,
  currentStep: 1,
  player: initialPlayerState,
  isLoading: false,
  combatHistory: [],
  lastStoryDescription: '',

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

  setLastStoryDescription: (description) => set({ lastStoryDescription: description }),

  // Inventory & Shop Implementation
  addItem: (item) => set((state) => ({
    player: {
      ...state.player,
      inventory: [...state.player.inventory, item]
    }
  })),

  removeItem: (itemId) => set((state) => ({
    player: {
      ...state.player,
      inventory: state.player.inventory.filter(i => i.id !== itemId)
    }
  })),

  modifyCurrency: (amount) => set((state) => ({
    player: {
      ...state.player,
      currency: state.player.currency + amount
    }
  })),

  canAfford: (cost) => {
    return get().player.currency >= cost;
  },

  useItem: (itemId) => set((state) => {
    const item = state.player.inventory.find(i => i.id === itemId);
    if (!item) return state;

    let newStats = { ...state.player.stats };

    // Apply effects
    if (item.effect) {
      if (item.effect.health) newStats.health = Math.min(100, newStats.health + item.effect.health);
      if (item.effect.power) newStats.power += item.effect.power;
      if (item.effect.defense) newStats.defense += item.effect.defense;
    }

    // Remove if consumable
    let newInventory = state.player.inventory;
    if (item.type === 'consumable') {
      newInventory = state.player.inventory.filter(i => i.id !== itemId);
    }

    return {
      player: {
        ...state.player,
        stats: newStats,
        inventory: newInventory
      }
    };
  }),

  resetGame: () => set({
    currentChapter: 1,
    currentStep: 1,
    player: initialPlayerState,
    isLoading: false,
    combatHistory: [],
    lastStoryDescription: '',
  }),

  getStoryContext: () => {
    const state = get();
    return {
      currentChapter: state.currentChapter,
      currentStep: state.currentStep,
      playerChoices: state.player.choices.map(c => `${c.choice} - ${c.outcome}`),
      playerStats: state.player.stats,
      combatHistory: state.combatHistory,
      previousStoryDescription: state.lastStoryDescription,
      inventory: state.player.inventory.map(i => i.name),
      currency: state.player.currency,
    };
  },
}));