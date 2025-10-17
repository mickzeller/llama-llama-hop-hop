interface SoundToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export default function SoundToggle({ enabled, onToggle }: SoundToggleProps) {
  return (
    <div
      onClick={onToggle}
      className="absolute bottom-5 right-5 p-2.5 bg-white/80 rounded-full cursor-pointer z-10 text-2xl transition-all duration-300 hover:bg-white hover:scale-110"
    >
      {enabled ? '🔊' : '🔇'}
    </div>
  );
}
