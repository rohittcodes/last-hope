import { Card } from '../ui/card';
import { StatsDisplay } from '../ui/stats-display';
import { ChapterHeader } from '../ui/chapter-header';
import { StoryOptions } from '../ui/story-options';
import { CombatDisplay } from '../game/combat-display';
import { useGameStore } from '../../lib/store/game-store';
import type { StoryNode } from '../../lib/types/game';

interface GameLayoutProps {
  storyNode: StoryNode;
  onChoice: (choice: string, nextStep: number, consequences?: StoryNode['options'][0]['consequences']) => void;
}

export function GameLayout({ storyNode, onChoice }: GameLayoutProps) {
  const { player } = useGameStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <ChapterHeader chapter={storyNode.chapter} />
          <StatsDisplay stats={player.stats} />
        </div>

        <Card className="p-6 bg-gray-800 border-gray-700">
          {storyNode.isInCombat && (
            <CombatDisplay
              enemyType={storyNode.enemyType!}
              enemyHealth={storyNode.enemyHealth!}
            />
          )}
          
          <p className="text-lg text-gray-100 leading-relaxed mb-8">
            {storyNode.description}
          </p>
          
          <StoryOptions 
            options={storyNode.options}
            onSelect={onChoice}
          />
        </Card>
      </div>
    </div>
  );
}