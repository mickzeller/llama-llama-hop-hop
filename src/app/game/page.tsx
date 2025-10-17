import { Metadata } from 'next';
import LlamaGame from '@/components/LlamaGame';

export const metadata: Metadata = {
  title: "Llama's Adventure - Llama Jump Game",
  description: 'A fun endless runner game inspired by Chrome\'s dinosaur game!',
};

export default function GamePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100">
      <LlamaGame />
    </main>
  );
}
