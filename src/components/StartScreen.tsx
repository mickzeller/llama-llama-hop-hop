interface StartScreenProps {
  onStart: () => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm z-10">
      <div className="text-6xl mb-5 animate-wiggle">🦙</div>
      <h1 className="text-5xl font-bold text-pink-500 mb-5 animate-bounce" style={{ textShadow: '3px 3px 0 #FFB6C1' }}>
        Llama&apos;s Adventure!
      </h1>
      <p className="text-xl text-gray-600 mb-8">Jump your way to glory!</p>
      <div className="text-center text-gray-600 text-lg leading-relaxed mb-5">
        Press SPACE or Click/Tap to jump<br />
        Avoid the cacti and rocks!<br />
        The game gets faster as you progress!
      </div>
      <button
        onClick={onStart}
        className="px-10 py-4 text-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
      >
        Start Adventure
      </button>
    </div>
  );
}
