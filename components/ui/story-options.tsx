import { Button } from './button';
import type { StoryNode } from '../../lib/types/game';

interface StoryOptionsProps {
  options: StoryNode['options'];
  onSelect: (option: string, next: number, consequences?: StoryNode['options'][0]['consequences']) => void;
}

export function StoryOptions({ options, onSelect }: StoryOptionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {options.map((option, index) => (
        <Button
          key={index}
          variant="outline"
          className="p-4 h-auto text-left hover:bg-gray-700 transition-colors"
          onClick={() => onSelect(option.option, option.next, option.consequences)}
        >
          <div>
            <span className="text-sm text-gray-300">Option {index + 1}</span>
            <p className="mt-2 text-white">{option.option}</p>
            {option.consequences && (
              <div className="mt-2 text-sm">
                {Object.entries(option.consequences).map(([stat, value]) => (
                  <span key={stat} className={`inline-block mr-2 ${value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stat} {value > 0 ? '+' : ''}{value}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
}