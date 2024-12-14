import { Button } from './button';
import type { StoryNode } from '../../lib/types/game';

interface StoryOptionsProps {
  options: StoryNode['options'];
  onSelect: (option: string, next: number) => void;
}

export function StoryOptions({ options, onSelect }: StoryOptionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {options.map((option, index) => (
        <Button
          key={index}
          variant="outline"
          className="p-4 h-auto text-left hover:bg-gray-700 transition-colors"
          onClick={() => onSelect(option.option, option.next)}
        >
          <span className="text-sm text-gray-300">Option {index + 1}</span>
          <p className="mt-2 text-white">{option.option}</p>
        </Button>
      ))}
    </div>
  );
}