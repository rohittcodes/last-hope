"use client";

import { useState, useEffect } from 'react';
import { useGameStore } from '../../lib/store/game-store';
import { generateStoryNode } from '../../lib/services/story-service';
import { calculateStatsChange } from '../../lib/utils/story-utils';
import { GameLayout } from '../layout/game-layout';
import { LoadingScreen } from '../game/loading-screen';
import type { StoryNode } from '../../lib/types/game';

export function GameInterface() {
  const [storyNode, setStoryNode] = useState<StoryNode | null>(null);
  const { 
    player,
    currentStep,
    isLoading,
    setStep,
    setChapter,
    addChoice,
    updateStats,
    addCombatEvent,
    setLoading,
    getStoryContext
  } = useGameStore();

  useEffect(() => {
    const loadStoryNode = async () => {
      setLoading(true);
      try {
        const context = getStoryContext();
        const node = await generateStoryNode(context, player.name);
        setStoryNode(node);
        
        // Update chapter if changed
        if (node.chapter !== context.currentChapter) {
          setChapter(node.chapter);
        }
        
        // Record combat encounter
        if (node.isInCombat) {
          addCombatEvent(`Encountered ${node.enemyType} with ${node.enemyHealth}% health`);
        }
      } catch (error) {
        console.error('Error loading story node:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoryNode();
  }, [currentStep, player.name]); // Add currentStep to dependencies

  const handleChoice = (choice: string, nextStep: number, consequences?: StoryNode['options'][0]['consequences']) => {
    // Calculate and apply stat changes
    const statsChange = calculateStatsChange(player.stats, choice, consequences);
    if (Object.keys(statsChange).length > 0) {
      updateStats(statsChange);
    }
    
    // Record the choice and its outcome
    const outcome = consequences 
      ? `Results: ${Object.entries(consequences)
          .map(([stat, value]) => `${stat} ${value > 0 ? '+' : ''}${value}`)
          .join(', ')}`
      : 'No immediate effects';
    
    addChoice(choice, outcome);
    setStep(nextStep);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!storyNode) return null;

  return (
    <GameLayout
      storyNode={storyNode}
      onChoice={handleChoice}
    />
  );
}