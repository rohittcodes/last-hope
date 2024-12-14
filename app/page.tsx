"use client";

import { useGameStore } from '../lib/store/game-store';
import { IntroScreen } from '../components/game/intro-screen';
import { GameInterface } from '../components/game/game-interface';

export default function Home() {
  const { player } = useGameStore();

  if (!player.name) {
    return <IntroScreen />;
  }

  return <GameInterface />;
}