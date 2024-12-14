"use client";

import { useState, useEffect } from 'react';
import { useGameStore } from '../../lib/store/game-store';
import { generateStoryNode } from '../../lib/services/story-service';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { StatsDisplay } from '../ui/stats-display';
import { ChapterHeader } from '../ui/chapter-header';
import { StoryOptions } from '../ui/story-options';
import type { StoryNode } from '../../lib/types/game';

export function GameInterface() {
  const [storyNode, setStoryNode] = useState<StoryNode | null>(null);
  const { 
    currentChapter, 
    currentStep,
    player,
    isLoading,
    setStep,
    addChoice,
    setLoading
  } = useGameStore();

  useEffect(() => {
    const loadStoryNode = async () => {
      setLoading(true);
      const context = `Previous choices: ${player.choices.join(", ")}`;
      const node = await generateStoryNode(
        context,
        currentChapter,
        currentStep,
        player.name
      );
      setStoryNode(node);
      setLoading(false);
    };

    loadStoryNode();
  }, [currentStep, currentChapter, player.name]);

  const handleChoice = (choice: string, nextStep: number) => {
    addChoice(choice);
    setStep(nextStep);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center space-y-4">
          <Progress value={30} className="w-[300px]" />
          <p className="text-white">Generating your story...</p>
        </div>
      </div>
    );
  }

  if (!storyNode) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <ChapterHeader chapter={currentChapter} />
          <StatsDisplay stats={player.stats} />
        </div>

        <Card className="p-6 bg-gray-800 border-gray-700">
          <p className="text-lg text-gray-100 leading-relaxed mb-8">
            {storyNode.description}
          </p>
          
          <StoryOptions 
            options={storyNode.options}
            onSelect={handleChoice}
          />
        </Card>
      </div>
    </div>
  );
}