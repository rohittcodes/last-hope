interface CombatDisplayProps {
    enemyType: string;
    enemyHealth: number;
  }
  
  export function CombatDisplay({ enemyType, enemyHealth }: CombatDisplayProps) {
    return (
      <div className="mb-4 p-4 bg-red-900/30 rounded-lg">
        <h3 className="text-red-400 font-semibold mb-2">Combat Encounter!</h3>
        <p className="text-gray-300">
          Enemy: {enemyType} (Health: {enemyHealth}%)
        </p>
      </div>
    );
  }