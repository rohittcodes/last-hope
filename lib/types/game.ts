export interface StoryNode {
  description: string;
  options: {
    option: string;
    next: number;
  }[];
}

export interface GameStats {
  power: number;
  defense: number;
  health: number;
}

export interface PlayerState {
  name: string;
  stats: GameStats;
  choices: string[];
}