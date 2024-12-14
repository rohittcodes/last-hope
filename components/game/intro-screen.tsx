import { useState } from 'react';
import { useGameStore } from '../../lib/store/game-store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Gamepad2 } from 'lucide-react';

export function IntroScreen() {
  const { setPlayerName } = useGameStore();
  const [inputName, setInputName] = useState('');

  const handleStartGame = () => {
    if (inputName.trim()) {
      setPlayerName(inputName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <Gamepad2 className="mx-auto h-12 w-12 text-purple-500" />
          <h1 className="text-4xl font-bold text-white">The Last Chronicle</h1>
          <p className="text-gray-300">
            Embark on an epic journey where your choices shape the story.
            Enter a world where every decision matters and the fate of
            civilization hangs in the balance.
          </p>
        </div>
        
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Enter your name"
            className="bg-gray-800 border-gray-700 text-white"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleStartGame()}
          />
          <Button 
            onClick={handleStartGame}
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={!inputName.trim()}
          >
            Begin Your Journey
          </Button>
        </div>
      </div>
    </div>
  );
}