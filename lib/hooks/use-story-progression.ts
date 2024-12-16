import { useEffect, useState } from 'react';
import { useGameStore } from '../store/game-store';
import { generateStoryNode } from '../services/story-service';
import { calculateStatsChange } from '../utils/story-utils';
import type { StoryNode } from '../types/game';

export function useStoryProgression() {
  const [storyNode, setStoryNode] = useState<StoryNode | null>(null);
  const {
    currentChapter,
    currentStep,
    player,
    isLoading,
    setStep,
    addChoice,
    updateStats,
    setLoading
  } = useGameStore();

  useEffect(() => {
    const loadStoryNode = async () => {
      setLoading(true);
      try {
        const context = `Player ${player.name} has made the following choices: ${player.choices.join(", ")}. 
                        Current stats - Power: ${player.stats.power}, Defense: ${player.stats.defense}, Health: ${player.stats.health}`;
        
        const contextObj = {
          currentChapter,
          currentStep,
          playerChoices: player.choices.map(choice => choice.choice),
          playerStats: player.stats,
          combatHistory: [] // Add appropriate combat history if available
        };
        const node = await generateStoryNode(contextObj, player.name);
        setStoryNode(node);
      } catch (error) {
        console.error('Error loading story node:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoryNode();
  }, [currentStep, currentChapter, player.name]);

  const handleChoice = (choice: string, nextStep: number) => {
    const statsChange = calculateStatsChange(player.stats, choice);
    updateStats(statsChange);
    const outcome = `Player chose: ${choice}. Stats change: ${JSON.stringify(statsChange)}`;
    addChoice(choice, outcome);
    setStep(nextStep);
  };

  return {
    storyNode,
    isLoading,
    handleChoice
  };
}