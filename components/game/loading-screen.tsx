import { Progress } from '../ui/progress';

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="text-center space-y-4">
        <Progress value={30} className="w-[300px]" />
        <p className="text-white">Generating your story...</p>
      </div>
    </div>
  );
}