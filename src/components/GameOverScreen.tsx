interface GameOverScreenProps {
  score: number;
  highScore: number;
  isNewRecord: boolean;
  onRetry: () => void;
}

export default function GameOverScreen({ score, highScore, isNewRecord, onRetry }: GameOverScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm z-10">
      <div className="text-6xl mb-5">😵</div>
      <h2 className="text-5xl font-bold text-pink-500 mb-5 animate-bounce" style={{ textShadow: '3px 3px 0 #FFB6C1' }}>
        Game Over!
      </h2>
      <div className="text-4xl text-gray-800 my-5">
        Score: <span className="font-bold">{score}</span>
      </div>
      {isNewRecord && (
        <div className="text-pink-500 text-3xl animate-pulse mb-3">
          🎉 New Record! 🎉
        </div>
      )}
      <button
        onClick={onRetry}
        className="px-10 py-4 text-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
      >
        Try Again
      </button>
    </div>
  );
}
