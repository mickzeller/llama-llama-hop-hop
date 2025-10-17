'use client';

import { useEffect, useRef, useState } from 'react';
import { GameState, LlamaCharacter, Obstacle, Cloud, Particle, Background } from '@/types/game';
import { AudioManager } from '@/lib/audio';
import GameCanvas from './GameCanvas';
import StartScreen from './StartScreen';
import GameOverScreen from './GameOverScreen';
import HUD from './HUD';
import SoundToggle from './SoundToggle';

export default function LlamaGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>(0);
  const audioManagerRef = useRef<AudioManager | null>(null);

  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameSpeed, setGameSpeed] = useState(5);

  // Game objects - using refs to avoid re-renders
  const llamaRef = useRef<LlamaCharacter>({
    x: 100,
    y: 350,
    width: 60,
    height: 80,
    velocityY: 0,
    velocityX: 0,
    jumping: false,
    doubleJumpAvailable: false,
    tripleJumpAvailable: true,
    tripleJumpCooldown: 0,
    tripleJumpMaxCooldown: 5000,
    jumpPower: -18,
    gravity: 0.65,
    groundY: 350,
    legAnimation: 0,
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const backgroundsRef = useRef<Background[]>([
    { x: 0, speed: 0.5, color: '#E6F3FF' },
    { x: 0, speed: 1, color: '#B8E6B8' },
    { x: 0, speed: 2, color: '#90EE90' },
  ]);

  // Initialize audio and load high score
  useEffect(() => {
    audioManagerRef.current = new AudioManager();
    const savedHighScore = localStorage.getItem('llamaHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Game loop logic
  const update = () => {
    if (gameState !== 'playing') return;

    const llama = llamaRef.current;
    const obstacles = obstaclesRef.current;
    const particles = particlesRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Update triple jump cooldown
    if (llama.tripleJumpCooldown > 0) {
      llama.tripleJumpCooldown -= 16.67; // ~1 frame at 60fps
      if (llama.tripleJumpCooldown < 0) {
        llama.tripleJumpCooldown = 0;
      }
    }

    // Physics
    llama.velocityY += llama.gravity;
    llama.y += llama.velocityY;

    // Horizontal velocity from triple jump
    if (llama.velocityX > 0) {
      llama.x += llama.velocityX;
      llama.velocityX *= 0.92;
      if (llama.velocityX < 0.1) {
        llama.velocityX = 0;
      }
    }

    // Keep on screen
    if (llama.x > canvas.width - llama.width - 50) {
      llama.x = canvas.width - llama.width - 50;
      llama.velocityX = 0;
    }

    // Return to starting position
    if (llama.velocityX === 0 && llama.x > 100) {
      llama.x -= 2;
      if (llama.x < 100) {
        llama.x = 100;
      }
    }

    // Animate legs
    llama.legAnimation += 0.3;

    // Ground collision
    if (llama.y >= llama.groundY) {
      llama.y = llama.groundY;
      llama.velocityY = 0;
      llama.jumping = false;
      llama.doubleJumpAvailable = false;
      llama.tripleJumpAvailable = true;
    }

    // Update obstacles
    obstaclesRef.current = obstacles.filter((obstacle) => {
      obstacle.x -= gameSpeed;

      // Collision detection
      if (
        llama.x < obstacle.x + obstacle.width &&
        llama.x + llama.width > obstacle.x &&
        llama.y + llama.height > obstacle.y
      ) {
        handleGameOver();
        return false;
      }

      // Score points
      if (!obstacle.passed && obstacle.x + obstacle.width < llama.x) {
        obstacle.passed = true;
        setScore((prev) => {
          const newScore = prev + 1;
          audioManagerRef.current?.playSound('score', soundEnabled);

          // Add particles
          for (let i = 0; i < 10; i++) {
            particles.push({
              x: llama.x + llama.width / 2,
              y: llama.y,
              vx: Math.random() * 4 - 2,
              vy: Math.random() * -5 - 2,
              life: 1,
              color: `hsl(${Math.random() * 60 + 30}, 100%, 60%)`,
            });
          }

          // Increase difficulty
          if (newScore % 5 === 0) {
            setGameSpeed((prev) => prev + 0.5);
          }

          return newScore;
        });
      }

      return obstacle.x > -obstacle.width;
    });

    // Spawn new obstacles
    if (Math.random() < 0.02 && obstaclesRef.current.length < 3) {
      const width = 30 + Math.random() * 20;
      const height = 40 + Math.random() * 30;
      obstaclesRef.current.push({
        width,
        height,
        x: canvas.width,
        y: llama.groundY + 40 - height,
        type: Math.random() > 0.5 ? 'cactus' : 'rock',
        passed: false,
      });
    }

    // Update particles
    particlesRef.current = particles.filter((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2;
      particle.life -= 0.02;
      return particle.life > 0;
    });

    // Update clouds
    cloudsRef.current.forEach((cloud) => {
      cloud.x -= cloud.speed;
      if (cloud.x < -100) {
        cloud.x = canvas.width + Math.random() * 200;
        cloud.y = Math.random() * 150;
      }
    });
  };

  const handleGameOver = () => {
    setGameState('gameover');
    audioManagerRef.current?.playSound('gameOver', soundEnabled);
    cancelAnimationFrame(animationIdRef.current);

    // Check for high score
    setScore((currentScore) => {
      if (currentScore > highScore) {
        const newHighScore = currentScore;
        setHighScore(newHighScore);
        localStorage.setItem('llamaHighScore', newHighScore.toString());
      }
      return currentScore;
    });
  };

  const handleJump = () => {
    if (gameState !== 'playing') return;

    const llama = llamaRef.current;
    const particles = particlesRef.current;

    // First jump
    if (!llama.jumping) {
      llama.velocityY = llama.jumpPower;
      llama.jumping = true;
      llama.doubleJumpAvailable = true;
      audioManagerRef.current?.playSound('jump', soundEnabled);
    }
    // Double jump
    else if (llama.doubleJumpAvailable) {
      llama.velocityY = llama.jumpPower * 0.85;
      llama.doubleJumpAvailable = false;
      audioManagerRef.current?.playSound('collect', soundEnabled);

      for (let i = 0; i < 8; i++) {
        particles.push({
          x: llama.x + llama.width / 2,
          y: llama.y + llama.height,
          vx: Math.random() * 4 - 2,
          vy: Math.random() * -5 - 2,
          life: 1,
          color: `hsl(${Math.random() * 60 + 30}, 100%, 60%)`,
        });
      }
    }
    // Triple jump
    else if (llama.tripleJumpAvailable && llama.tripleJumpCooldown <= 0) {
      llama.velocityY = llama.jumpPower * 0.7;
      llama.velocityX = gameSpeed * 2.5;
      llama.tripleJumpAvailable = false;
      llama.tripleJumpCooldown = llama.tripleJumpMaxCooldown;
      audioManagerRef.current?.playSound('score', soundEnabled);

      for (let i = 0; i < 15; i++) {
        particles.push({
          x: llama.x + llama.width / 2,
          y: llama.y + llama.height,
          vx: Math.random() * 4 - 2,
          vy: Math.random() * -5 - 2,
          life: 1,
          color: `hsl(${Math.random() * 360}, 100%, 60%)`,
        });
      }
    }
  };

  const startGame = () => {
    audioManagerRef.current?.init();
    setGameState('playing');
    setScore(0);
    setGameSpeed(5);
    obstaclesRef.current = [];
    particlesRef.current = [];

    // Reset Llama
    const llama = llamaRef.current;
    llama.x = 100;
    llama.y = llama.groundY;
    llama.velocityY = 0;
    llama.velocityX = 0;
    llama.jumping = false;
    llama.doubleJumpAvailable = false;
    llama.tripleJumpAvailable = true;
    llama.tripleJumpCooldown = 0;

    // Initialize clouds
    cloudsRef.current = Array.from({ length: 5 }, () => ({
      x: Math.random() * (canvasRef.current?.width || 900) + 200,
      y: Math.random() * 150,
      speed: 0.5 + Math.random() * 1,
      size: 20 + Math.random() * 30,
    }));
  };

  const retryGame = () => {
    startGame();
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const newValue = !prev;
      if (newValue) {
        audioManagerRef.current?.init();
        audioManagerRef.current?.playSound('collect', true);
      }
      return newValue;
    });
  };

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      const gameLoop = () => {
        update();
        animationIdRef.current = requestAnimationFrame(gameLoop);
      };
      animationIdRef.current = requestAnimationFrame(gameLoop);

      return () => {
        cancelAnimationFrame(animationIdRef.current);
      };
    }
  }, [gameState, gameSpeed, soundEnabled]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'menu') {
          startGame();
        } else {
          handleJump();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [gameState, soundEnabled]);

  return (
    <div className="relative w-[900px] h-[500px] rounded-3xl shadow-2xl overflow-hidden">
      <GameCanvas
        ref={canvasRef}
        llamaRef={llamaRef}
        obstaclesRef={obstaclesRef}
        particlesRef={particlesRef}
        cloudsRef={cloudsRef}
        backgroundsRef={backgroundsRef}
        gameState={gameState}
        gameSpeed={gameSpeed}
        onJump={handleJump}
      />

      {gameState === 'menu' && <StartScreen onStart={startGame} />}

      {gameState === 'gameover' && (
        <GameOverScreen
          score={score}
          highScore={highScore}
          isNewRecord={score > 0 && score === highScore}
          onRetry={retryGame}
        />
      )}

      <HUD score={score} highScore={highScore} visible={gameState === 'playing'} gameSpeed={gameSpeed} />

      <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
    </div>
  );
}
