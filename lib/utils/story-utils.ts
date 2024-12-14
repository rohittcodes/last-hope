import type { StoryNode, GameStats } from '../types/game';

export const calculateStatsChange = (
  currentStats: GameStats,
  choice: string
): Partial<GameStats> => {
  // Basic stats modification based on choice keywords
  const statsChange: Partial<GameStats> = {};
  
  if (choice.toLowerCase().includes('fight') || choice.toLowerCase().includes('attack')) {
    statsChange.power = Math.min(currentStats.power + 5, 100);
    statsChange.health = Math.max(currentStats.health - 10, 0);
  }
  
  if (choice.toLowerCase().includes('defend') || choice.toLowerCase().includes('protect')) {
    statsChange.defense = Math.min(currentStats.defense + 5, 100);
  }
  
  if (choice.toLowerCase().includes('heal') || choice.toLowerCase().includes('rest')) {
    statsChange.health = Math.min(currentStats.health + 15, 100);
  }
  
  return statsChange;
};

export const getInitialStoryNode = (): StoryNode => ({
  description: `In a world ravaged by an unknown catastrophe, you find yourself standing at the crossroads of humanity's fate. The air is thick with tension, and the weight of responsibility rests heavily on your shoulders. Before you lies a path that will determine not just your destiny, but the future of what remains of civilization.`,
  options: [
    {
      option: "Venture into the ruins of the old city to search for survivors and resources",
      next: 2
    },
    {
      option: "Head towards the reported safe haven in the mountains",
      next: 3
    }
  ]
});