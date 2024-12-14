import type { GameStats, StoryNode, PlayerState } from '../types/game';

export const calculateStatsChange = (
  currentStats: GameStats,
  choice: string,
  consequences?: StoryNode['options'][0]['consequences']
): Partial<GameStats> => {
  const statsChange: Partial<GameStats> = {};
  
  // Apply direct consequences if provided
  if (consequences) {
    if (consequences.health) statsChange.health = Math.max(0, Math.min(100, currentStats.health + consequences.health));
    if (consequences.power) statsChange.power = Math.max(0, Math.min(100, currentStats.power + consequences.power));
    if (consequences.defense) statsChange.defense = Math.max(0, Math.min(100, currentStats.defense + consequences.defense));
    if (consequences.experience) {
      statsChange.experience = currentStats.experience + consequences.experience;
      // Level up every 100 experience points
      const newLevel = Math.floor(statsChange.experience / 100) + 1;
      if (newLevel > currentStats.level) {
        statsChange.level = newLevel;
        statsChange.power = Math.min(100, currentStats.power + 5);
        statsChange.defense = Math.min(100, currentStats.defense + 5);
        statsChange.health = 100; // Full health on level up
      }
    }
  }
  
  return statsChange;
};

export const formatStoryContext = (choices: PlayerState['choices']): string => {
  return choices.map(choice => 
    `Chapter ${choice.chapter}, Step ${choice.step}: ${choice.choice} - ${choice.outcome}`
  ).join('\n');
};

export const getInitialStats = (): GameStats => ({
  power: 50,
  defense: 50,
  health: 100,
  experience: 0,
  level: 1,
});