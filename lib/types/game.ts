export interface StoryNode {
  description: string;
  chapter: number;
  options: {
    option: string;
    next: number;
    consequences?: {
      health?: number;
      power?: number;
      defense?: number;
      experience?: number;
    };
  }[];
  isInCombat?: boolean;
  enemyType?: string;
  enemyHealth?: number;
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
}