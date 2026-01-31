"use client";

import { useState, useEffect } from 'react';
import { useGameStore } from '../../lib/store/game-store';
import { generateStoryNode } from '../../lib/services/story-service';
import { generateStoryImage } from '../../lib/services/image-service';
import { calculateStatsChange } from '../../lib/utils/story-utils';
import { GameLayout } from '../layout/game-layout';
import { LoadingScreen } from '../game/loading-screen';
import { InventorySheet } from './inventory-sheet';
import { ShopSheet } from './shop-sheet';
import { Button } from '../ui/button';
import { ShoppingBag } from 'lucide-react';
import type { StoryNode } from '../../lib/types/game';

export function GameInterface() {
  const [storyNode, setStoryNode] = useState<StoryNode | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isShopOpen, setIsShopOpen] = useState(false);

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
    getStoryContext,
    setLastStoryDescription
  } = useGameStore();

  useEffect(() => {
    const loadStoryNode = async () => {
      setLoading(true);
      setImageUrl(null); // Reset image while loading
      setIsShopOpen(false); // Close shop on new turn
      try {
        const context = getStoryContext();
        const node = await generateStoryNode(context, player.name);
        setStoryNode(node);

        // Generate image based on visual description or standard description
        const imageDescription = (node as any).visualDescription || node.description;
        console.log('Generating image for step', context.currentStep);
        console.log('Visual Description:', imageDescription);

        const url = generateStoryImage(imageDescription);
        console.log('Generated Image URL:', url);

        setImageUrl(url);

        // Update chapter if changed
        if (node.chapter !== context.currentChapter) {
          setChapter(node.chapter);
        }

        // Record combat encounter
        if (node.isInCombat) {
          addCombatEvent(`Encountered ${node.enemyType} with ${node.enemyHealth}% health`);
        }

        // Shop stays closed until manually opened
        if (node.shopItems && node.shopItems.length > 0) {
          // setIsShopOpen(true); // Don't auto-open
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
    // Save current story description as context for the next turn
    if (storyNode) {
      setLastStoryDescription(storyNode.description);
    }
    setStep(nextStep);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!storyNode) return null;

  return (
    <>
      <GameLayout
        storyNode={storyNode}
        imageUrl={imageUrl}
        onChoice={handleChoice}
      />
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {storyNode.shopItems && storyNode.shopItems.length > 0 && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsShopOpen(true)}
            className="animate-pulse bg-yellow-500/10 border-yellow-500/50 hover:bg-yellow-500/20"
          >
            <ShoppingBag className="h-5 w-5 text-yellow-500" />
          </Button>
        )}
        <InventorySheet />
      </div>
      {storyNode.shopItems && (
        <ShopSheet
          isOpen={isShopOpen}
          onClose={() => setIsShopOpen(false)}
          items={storyNode.shopItems}
        />
      )}
    </>
  );
}
