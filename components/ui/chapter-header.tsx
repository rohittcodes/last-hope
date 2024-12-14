import { Scroll } from 'lucide-react';

interface ChapterHeaderProps {
  chapter: number;
}

export function ChapterHeader({ chapter }: ChapterHeaderProps) {
  return (
    <div className="flex items-center space-x-2">
      <Scroll className="w-6 h-6 text-yellow-500" />
      <span className="text-white">Chapter {chapter}</span>
    </div>
  );
}