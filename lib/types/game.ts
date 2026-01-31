export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'misc';
  description: string;
  cost: number;
  effect?: {
    health?: number;
    power?: number;
    defense?: number;
  };
}

export interface StoryNode {
  description: string;
  visualDescription?: string;
  chapter: number;
  options: {
    option: string;
    next: number;
    consequences?: {
      health?: number;
      power?: number;
      defense?: number;
      experience?: number;
      currency?: number;
    };
  }[];
  isInCombat?: boolean;
  enemyType?: string;
  enemyHealth?: number;
  shopItems?: Item[];
}

export interface GameStats {
  power: number;
  defense: number;
  health: number;
  experience: number;
  level: number;
}

export interface PlayerState {
  name: string;
  stats: GameStats;
  currency: number;
  inventory: Item[];
  choices: Array<{
    chapter: number;
    step: number;
    choice: string;
    outcome: string;
  }>;
}

export interface StoryContext {
  currentChapter: number;
  currentStep: number;
  playerChoices: string[];
  playerStats: GameStats;
  combatHistory: string[];
  previousStoryDescription?: string;
  inventory: string[]; // Names of items in inventory
  currency: number;
}