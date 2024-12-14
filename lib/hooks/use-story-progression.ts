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
        
        const node = await generateStoryNode(
          context,
          currentChapter,
          currentStep,
          player.name
        );
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
    addChoice(choice);
    setStep(nextStep);
  };

  return {
    storyNode,
    isLoading,
    handleChoice
  };
}