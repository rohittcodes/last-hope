import { useState } from 'react';
import { useGameStore } from '../../lib/store/game-store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Gamepad2, Sparkles } from 'lucide-react';

export function IntroScreen() {
  const { setPlayerName } = useGameStore();
  const [inputName, setInputName] = useState('');

  const handleStartGame = () => {
    if (inputName.trim()) {
      setPlayerName(inputName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-300 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-200 rounded-full animate-pulse delay-700"></div>
      </div>
      
      <div className="max-w-md w-full space-y-10 text-center relative z-10">
        {/* Glass card container */}
        <div className="backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10 p-8 shadow-2xl">
          <div className="space-y-6">
            {/* Icon with glow effect */}
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-purple-500/30 rounded-full"></div>
              <Gamepad2 className="relative mx-auto h-16 w-16 text-purple-400 drop-shadow-lg animate-pulse" />
            </div>
            
            {/* Title with better typography */}
            <div className="space-y-3">
              <h1 className="text-5xl font-extrabold text-white bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent tracking-tight">
                The Last Chronicle
              </h1>
              <div className="flex items-center justify-center space-x-2">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-purple-400"></div>
                <Sparkles className="h-4 w-4 text-purple-400" />
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-purple-400"></div>
              </div>
            </div>
            
            {/* Description with improved readability */}
            <p className="text-gray-300 leading-relaxed text-base font-light">
              Embark on an epic journey where your choices shape the story.
              Enter a world where every decision matters and the fate of
              civilization hangs in the balance.
            </p>
          </div>
        </div>
        
        {/* Input section with enhanced styling */}
        <div className="space-y-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter your name"
              className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 h-12 rounded-xl backdrop-blur-sm focus:bg-gray-800/70 focus:border-purple-500/50 transition-all duration-300 text-center text-lg"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleStartGame()}
            />
          </div>
          
          <Button 
            onClick={handleStartGame}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 h-12 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-50"
            disabled={!inputName.trim()}
          >
            <span className="flex items-center justify-center space-x-2">
              <span>Begin Your Journey</span>
              <Sparkles className="h-4 w-4" />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}