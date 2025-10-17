import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100">
      <main className="flex flex-col items-center text-center max-w-2xl px-8">
        <div className="text-8xl mb-8 animate-wiggle">🦙</div>
        <h1 className="text-6xl font-bold text-pink-500 mb-4" style={{ textShadow: '3px 3px 0 #FFB6C1' }}>
          Llama&apos;s Adventure
        </h1>
        <p className="text-2xl text-gray-700 mb-8">
          Jump, dash, and dodge your way through an endless adventure!
        </p>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Features</h2>
          <ul className="text-left space-y-2 text-gray-700">
            <li>🎮 <strong>Double Jump</strong> - Press jump again in mid-air!</li>
            <li>⚡ <strong>Triple Jump Boost</strong> - Dash forward with a 5-second cooldown</li>
            <li>📈 <strong>Progressive Difficulty</strong> - Gets faster as you score</li>
            <li>🎵 <strong>Procedural Sound Effects</strong> - Dynamic audio using Web Audio API</li>
            <li>✨ <strong>Particle Effects</strong> - Beautiful visual feedback</li>
            <li>🏆 <strong>High Score Tracking</strong> - Beat your personal best!</li>
          </ul>
        </div>

        <Link
          href="/game"
          className="px-12 py-5 text-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 font-bold"
        >
          Start Playing! 🎮
        </Link>

        <p className="text-sm text-gray-600 mt-8">
          Use SPACE or click/tap to jump. Have fun!
        </p>
      </main>
    </div>
  );
}
