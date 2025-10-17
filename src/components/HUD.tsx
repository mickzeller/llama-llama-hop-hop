interface HUDProps {
  score: number;
  highScore: number;
  visible: boolean;
  gameSpeed: number;
}

export default function HUD({ score, highScore, visible, gameSpeed }: HUDProps) {
  if (!visible) return null;

  return (
    <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm rounded-[30px] px-8 py-4 shadow-xl z-[5] flex items-center gap-8">
      <div className="flex flex-col items-center">
        <div className="text-gray-600 text-sm font-bold uppercase tracking-wide">Score</div>
        <div className="text-gray-900 text-4xl font-bold">{score}</div>
      </div>

      <div className="w-px h-12 bg-gray-300"></div>

      <div className="flex flex-col items-center">
        <div className="text-gray-600 text-sm font-bold uppercase tracking-wide">High Score</div>
        <div className="text-gray-900 text-4xl font-bold">{highScore}</div>
      </div>

      <div className="w-px h-12 bg-gray-300"></div>

      <div className="flex flex-col items-center">
        <div className="text-gray-600 text-sm font-bold uppercase tracking-wide">Speed</div>
        <div className="text-gray-900 text-4xl font-bold">{gameSpeed.toFixed(1)}x</div>
      </div>
    </div>
  );
}
