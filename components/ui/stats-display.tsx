import { GameStats } from '../../lib/types/game';
import { Sword, Shield, Heart } from 'lucide-react';

interface StatsDisplayProps {
  stats: GameStats;
}

export function StatsDisplay({ stats }: StatsDisplayProps) {
  return (
    <div className="flex space-x-4">
      <div className="flex items-center space-x-2">
        <Sword className="w-6 h-6 text-red-500" />
        <span className="text-white">Power: {stats.power}%</span>
      </div>
      <div className="flex items-center space-x-2">
        <Shield className="w-6 h-6 text-blue-500" />
        <span className="text-white">Defense: {stats.defense}%</span>
      </div>
      <div className="flex items-center space-x-2">
        <Heart className="w-6 h-6 text-green-500" />
        <span className="text-white">Health: {stats.health}%</span>
      </div>
    </div>
  );
}