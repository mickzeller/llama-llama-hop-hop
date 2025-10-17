'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, RefObject } from 'react';
import { LlamaCharacter, Obstacle, Particle, Cloud, Background, GameState } from '@/types/game';

interface GameCanvasProps {
  llamaRef: RefObject<LlamaCharacter>;
  obstaclesRef: RefObject<Obstacle[]>;
  particlesRef: RefObject<Particle[]>;
  cloudsRef: RefObject<Cloud[]>;
  backgroundsRef: RefObject<Background[]>;
  gameState: GameState;
  gameSpeed: number;
  onJump: () => void;
}

const GameCanvas = forwardRef<HTMLCanvasElement, GameCanvasProps>(
  ({ llamaRef, obstaclesRef, particlesRef, cloudsRef, backgroundsRef, gameState, gameSpeed, onJump }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => canvasRef.current!);

    // Draw functions
    const drawBackground = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const llama = llamaRef.current!;
      const clouds = cloudsRef.current!;
      const backgrounds = backgroundsRef.current!;

      // Sky gradient (sky blue to yellow horizon)
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(0.5, '#B0E0E6');
      gradient.addColorStop(0.75, '#FFE8A3');
      gradient.addColorStop(1, '#F5DDA9');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw sun in top-right
      ctx.save();
      const sunX = canvas.width - 150;
      const sunY = 120;
      const sunRadius = 50;

      // Sun glow
      const sunGlow = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.5, sunX, sunY, sunRadius * 2);
      sunGlow.addColorStop(0, 'rgba(255, 223, 0, 0.3)');
      sunGlow.addColorStop(1, 'rgba(255, 223, 0, 0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(sunX - sunRadius * 2, sunY - sunRadius * 2, sunRadius * 4, sunRadius * 4);

      // Sun body
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fill();

      // Sun rays
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        const rayStart = sunRadius + 10;
        const rayEnd = sunRadius + 30;
        ctx.beginPath();
        ctx.moveTo(sunX + Math.cos(angle) * rayStart, sunY + Math.sin(angle) * rayStart);
        ctx.lineTo(sunX + Math.cos(angle) * rayEnd, sunY + Math.sin(angle) * rayEnd);
        ctx.stroke();
      }
      ctx.restore();

      // Draw clouds
      clouds.forEach((cloud) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 0.5, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
        ctx.arc(cloud.x - cloud.size * 0.5, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw parallax mountains with snow caps
      backgrounds.forEach((bg, index) => {
        bg.x -= bg.speed;
        if (bg.x <= -canvas.width) {
          bg.x = 0;
        }

        if (index === 0) {
          // Far mountains with snow caps
          ctx.globalAlpha = 0.6;
          ctx.fillStyle = '#8B7D6B';
          ctx.beginPath();
          ctx.moveTo(bg.x, canvas.height);
          ctx.lineTo(bg.x + 100, 280);
          ctx.lineTo(bg.x + 250, 200);
          ctx.lineTo(bg.x + 400, 250);
          ctx.lineTo(bg.x + 550, 220);
          ctx.lineTo(bg.x + 700, 270);
          ctx.lineTo(bg.x + canvas.width, 250);
          ctx.lineTo(bg.x + canvas.width, canvas.height);
          ctx.fill();

          // Snow caps
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(bg.x + 235, 215);
          ctx.lineTo(bg.x + 250, 200);
          ctx.lineTo(bg.x + 265, 215);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(bg.x + 535, 235);
          ctx.lineTo(bg.x + 550, 220);
          ctx.lineTo(bg.x + 565, 235);
          ctx.fill();

          ctx.globalAlpha = 1;
        } else if (index === 1) {
          // Mid mountains
          ctx.globalAlpha = 0.8;
          ctx.fillStyle = '#9D8B7A';
          ctx.beginPath();
          ctx.moveTo(bg.x, canvas.height);
          ctx.lineTo(bg.x + 150, 300);
          ctx.lineTo(bg.x + 350, 250);
          ctx.lineTo(bg.x + 550, 290);
          ctx.lineTo(bg.x + canvas.width, 280);
          ctx.lineTo(bg.x + canvas.width, canvas.height);
          ctx.fill();

          // Snow cap
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(bg.x + 335, 265);
          ctx.lineTo(bg.x + 350, 250);
          ctx.lineTo(bg.x + 365, 265);
          ctx.fill();

          ctx.globalAlpha = 1;
        }
      });

      // Ground with gradient
      const groundGradient = ctx.createLinearGradient(0, llama.groundY + 80, 0, canvas.height);
      groundGradient.addColorStop(0, '#B8956A');
      groundGradient.addColorStop(1, '#9D7A54');
      ctx.fillStyle = groundGradient;
      ctx.fillRect(0, llama.groundY + 80, canvas.width, canvas.height - llama.groundY - 80);

      // Ground texture (dots/pebbles)
      ctx.fillStyle = 'rgba(139, 115, 85, 0.3)';
      for (let i = 0; i < 100; i++) {
        const x = (i * 137) % canvas.width;
        const y = llama.groundY + 80 + ((i * 73) % (canvas.height - llama.groundY - 80));
        const size = 1 + (i % 3);
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Decorative flowers (static positions based on scroll)
      const scrollOffset = Date.now() * 0.05;
      for (let i = 0; i < 8; i++) {
        const baseX = i * 150 - (scrollOffset % 150);
        if (baseX > -50 && baseX < canvas.width + 50) {
          const flowerX = baseX;
          const flowerY = llama.groundY + 70;

          // Stem
          ctx.strokeStyle = '#228B22';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(flowerX, flowerY + 10);
          ctx.lineTo(flowerX, flowerY - 10);
          ctx.stroke();

          // Flower petals
          ctx.fillStyle = '#FF69B4';
          for (let p = 0; p < 5; p++) {
            const angle = (Math.PI * 2 / 5) * p;
            ctx.beginPath();
            ctx.arc(flowerX + Math.cos(angle) * 4, flowerY - 10 + Math.sin(angle) * 4, 3, 0, Math.PI * 2);
            ctx.fill();
          }

          // Flower center
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(flowerX, flowerY - 10, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Decorative grass tufts
      ctx.strokeStyle = '#228B22';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      for (let i = 0; i < 15; i++) {
        const grassX = i * 80 - ((scrollOffset * 0.5) % 80);
        if (grassX > -20 && grassX < canvas.width + 20) {
          const grassY = llama.groundY + 80;
          for (let blade = 0; blade < 3; blade++) {
            ctx.beginPath();
            ctx.moveTo(grassX + blade * 3, grassY);
            ctx.lineTo(grassX + blade * 3 + (Math.sin(Date.now() / 500 + blade) * 2), grassY - 8);
            ctx.stroke();
          }
        }
      }

      // Ground line
      ctx.strokeStyle = '#8B7355';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, llama.groundY + 80);
      ctx.lineTo(canvas.width, llama.groundY + 80);
      ctx.stroke();
    };

    const drawLlama = (ctx: CanvasRenderingContext2D) => {
      const llama = llamaRef.current!;
      ctx.save();

      // Animated legs (draw first, behind body)
      ctx.fillStyle = '#F5DEB3';
      const legOffset = Math.sin(llama.legAnimation) * 5;

      // Back legs (rounded tops)
      ctx.beginPath();
      ctx.roundRect(llama.x + 12, llama.y + llama.height - 20, 6, 20 + legOffset, [3, 3, 0, 0]);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(llama.x + llama.width - 18, llama.y + llama.height - 20, 6, 20 + legOffset, [3, 3, 0, 0]);
      ctx.fill();

      // Front legs (rounded tops)
      ctx.beginPath();
      ctx.roundRect(llama.x + 22, llama.y + llama.height - 20, 6, 20 - legOffset, [3, 3, 0, 0]);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(llama.x + llama.width - 8, llama.y + llama.height - 20, 6, 20 - legOffset, [3, 3, 0, 0]);
      ctx.fill();

      // Hooves (cute and rounded)
      ctx.fillStyle = '#8B7355';
      ctx.beginPath();
      ctx.roundRect(llama.x + 12, llama.y + llama.height, 6, 3, [0, 0, 2, 2]);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(llama.x + 22, llama.y + llama.height - 1, 6, 4, [0, 0, 2, 2]);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(llama.x + llama.width - 18, llama.y + llama.height, 6, 3, [0, 0, 2, 2]);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(llama.x + llama.width - 8, llama.y + llama.height - 1, 6, 4, [0, 0, 2, 2]);
      ctx.fill();

      // Body (extra fluffy rounded shape)
      ctx.fillStyle = '#FFF8DC';
      ctx.beginPath();
      ctx.ellipse(llama.x + llama.width / 2, llama.y + 50, llama.width / 2.2, llama.height / 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fluffy wool texture circles on body (more and fluffier!)
      ctx.fillStyle = 'rgba(255, 248, 220, 0.9)';
      const woolPositions = [
        [llama.x + 15, llama.y + 40, 10],
        [llama.x + 28, llama.y + 45, 12],
        [llama.x + 42, llama.y + 42, 11],
        [llama.x + 35, llama.y + 55, 10],
        [llama.x + 20, llama.y + 58, 9],
        [llama.x + 48, llama.y + 52, 10],
        [llama.x + 25, llama.y + 48, 8],
      ];
      woolPositions.forEach(([x, y, radius]) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Extra fluffy outline effect
      ctx.strokeStyle = 'rgba(255, 248, 220, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(llama.x + llama.width / 2, llama.y + 50, llama.width / 2.2 + 2, llama.height / 2.5 + 2, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Neck (slightly thicker for cuter proportions)
      ctx.fillStyle = '#FFE4B5';
      ctx.beginPath();
      ctx.ellipse(llama.x + llama.width / 2, llama.y + 28, 14, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head (slightly bigger for cuter proportions)
      ctx.fillStyle = '#FFE4B5';
      ctx.beginPath();
      ctx.ellipse(llama.x + llama.width / 2, llama.y + 14, 24, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Snout (rounder and cuter)
      ctx.fillStyle = '#FFEFD5';
      ctx.beginPath();
      ctx.ellipse(llama.x + llama.width / 2, llama.y + 22, 14, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ears (bigger and fluffier)
      ctx.fillStyle = '#FFE4B5';
      ctx.beginPath();
      ctx.ellipse(llama.x + 14, llama.y + 4, 7, 12, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(llama.x + llama.width - 14, llama.y + 4, 7, 12, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Inner ear (pink and cute)
      ctx.fillStyle = '#FFB6C1';
      ctx.beginPath();
      ctx.ellipse(llama.x + 14, llama.y + 6, 3.5, 6, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(llama.x + llama.width - 14, llama.y + 6, 3.5, 6, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Ear fluff tips
      ctx.fillStyle = 'rgba(255, 248, 220, 0.8)';
      ctx.beginPath();
      ctx.arc(llama.x + 14, llama.y - 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(llama.x + llama.width - 14, llama.y - 2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Cute eyebrows (happy and expressive)
      ctx.strokeStyle = '#D4A574';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(llama.x + 14, llama.y + 8);
      ctx.quadraticCurveTo(llama.x + 18, llama.y + 6, llama.x + 22, llama.y + 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(llama.x + llama.width - 14, llama.y + 8);
      ctx.quadraticCurveTo(llama.x + llama.width - 18, llama.y + 6, llama.x + llama.width - 22, llama.y + 8);
      ctx.stroke();

      // Eyes (HUGE and adorable!)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(llama.x + 18, llama.y + 15, 7, 0, Math.PI * 2);
      ctx.arc(llama.x + llama.width - 18, llama.y + 15, 7, 0, Math.PI * 2);
      ctx.fill();

      // Subtle eye outline for definition
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(llama.x + 18, llama.y + 15, 7, 0, Math.PI * 2);
      ctx.arc(llama.x + llama.width - 18, llama.y + 15, 7, 0, Math.PI * 2);
      ctx.stroke();

      // Pupils (super cute and round)
      ctx.fillStyle = '#1A1A1A';
      ctx.beginPath();
      ctx.arc(llama.x + 19, llama.y + 16, 2.8, 0, Math.PI * 2);
      ctx.arc(llama.x + llama.width - 17, llama.y + 16, 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Eye shine/highlights (big sparkly anime-style!)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(llama.x + 20.5, llama.y + 13.5, 2.5, 0, Math.PI * 2);
      ctx.arc(llama.x + llama.width - 15.5, llama.y + 13.5, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Smaller secondary highlight for extra sparkle
      ctx.beginPath();
      ctx.arc(llama.x + 17, llama.y + 17.5, 1.2, 0, Math.PI * 2);
      ctx.arc(llama.x + llama.width - 19, llama.y + 17.5, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Cute curved eyelashes
      ctx.strokeStyle = '#2C1810';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(llama.x + 17 + i * 2, llama.y + 9);
        ctx.quadraticCurveTo(llama.x + 16 + i * 2, llama.y + 6, llama.x + 15 + i * 2, llama.y + 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(llama.x + llama.width - 17 - i * 2, llama.y + 9);
        ctx.quadraticCurveTo(llama.x + llama.width - 16 - i * 2, llama.y + 6, llama.x + llama.width - 15 - i * 2, llama.y + 5);
        ctx.stroke();
      }

      // Rosy cheeks for extra cuteness (bigger and pinker!)
      ctx.fillStyle = 'rgba(255, 182, 193, 0.6)';
      ctx.beginPath();
      ctx.arc(llama.x + 10, llama.y + 21, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(llama.x + llama.width - 10, llama.y + 21, 6, 0, Math.PI * 2);
      ctx.fill();

      // Extra blush glow
      ctx.fillStyle = 'rgba(255, 192, 203, 0.3)';
      ctx.beginPath();
      ctx.arc(llama.x + 10, llama.y + 21, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(llama.x + llama.width - 10, llama.y + 21, 8, 0, Math.PI * 2);
      ctx.fill();

      // Nostrils
      ctx.fillStyle = '#8B6F47';
      ctx.beginPath();
      ctx.arc(llama.x + llama.width / 2 - 4, llama.y + 24, 1.5, 0, Math.PI * 2);
      ctx.arc(llama.x + llama.width / 2 + 4, llama.y + 24, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Happy smile (bigger and friendlier)
      ctx.strokeStyle = '#8B6F47';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(llama.x + llama.width / 2, llama.y + 24, 8, 0.1, Math.PI - 0.1);
      ctx.stroke();

      // Little smile dimples
      ctx.fillStyle = 'rgba(139, 111, 71, 0.2)';
      ctx.beginPath();
      ctx.arc(llama.x + llama.width / 2 - 9, llama.y + 26, 2, 0, Math.PI * 2);
      ctx.arc(llama.x + llama.width / 2 + 9, llama.y + 26, 2, 0, Math.PI * 2);
      ctx.fill();

      // Fluffy tuft on head (extra fluffy!)
      ctx.fillStyle = 'rgba(255, 248, 220, 0.9)';
      ctx.beginPath();
      ctx.arc(llama.x + llama.width / 2, llama.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(llama.x + llama.width / 2 - 6, llama.y + 3, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(llama.x + llama.width / 2 + 6, llama.y + 3, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(llama.x + llama.width / 2, llama.y + 5, 5, 0, Math.PI * 2);
      ctx.fill();

      // Adorable bow on tuft
      ctx.fillStyle = '#FF69B4';
      // Left bow loop
      ctx.beginPath();
      ctx.ellipse(llama.x + llama.width / 2 - 5, llama.y - 3, 4, 5, -0.5, 0, Math.PI * 2);
      ctx.fill();
      // Right bow loop
      ctx.beginPath();
      ctx.ellipse(llama.x + llama.width / 2 + 5, llama.y - 3, 4, 5, 0.5, 0, Math.PI * 2);
      ctx.fill();
      // Bow center knot
      ctx.beginPath();
      ctx.arc(llama.x + llama.width / 2, llama.y - 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // Bow ribbons
      ctx.beginPath();
      ctx.moveTo(llama.x + llama.width / 2 - 1, llama.y - 1);
      ctx.lineTo(llama.x + llama.width / 2 - 3, llama.y + 3);
      ctx.lineTo(llama.x + llama.width / 2 - 1, llama.y + 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(llama.x + llama.width / 2 + 1, llama.y - 1);
      ctx.lineTo(llama.x + llama.width / 2 + 3, llama.y + 3);
      ctx.lineTo(llama.x + llama.width / 2 + 1, llama.y + 2);
      ctx.fill();

      // Tail (extra fluffy!)
      ctx.fillStyle = '#FFF8DC';
      ctx.beginPath();
      ctx.moveTo(llama.x + 6, llama.y + 55);
      ctx.quadraticCurveTo(llama.x - 4, llama.y + 60, llama.x, llama.y + 66);
      ctx.quadraticCurveTo(llama.x + 10, llama.y + 64, llama.x + 10, llama.y + 58);
      ctx.fill();

      // Fluffy tail tip
      ctx.beginPath();
      ctx.arc(llama.x - 1, llama.y + 67, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(llama.x + 2, llama.y + 68, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(llama.x - 3, llama.y + 65, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawObstacle = (ctx: CanvasRenderingContext2D, obstacle: Obstacle) => {
      ctx.save();

      if (obstacle.type === 'cactus') {
        // Draw cactus body
        ctx.fillStyle = '#228B22';
        ctx.fillRect(obstacle.x + obstacle.width * 0.3, obstacle.y, obstacle.width * 0.4, obstacle.height);
        ctx.fillRect(obstacle.x, obstacle.y + obstacle.height * 0.3, obstacle.width * 0.7, obstacle.width * 0.3);
        ctx.fillRect(obstacle.x + obstacle.width * 0.6, obstacle.y + obstacle.height * 0.5, obstacle.width * 0.4, obstacle.width * 0.3);

        // Draw cactus spikes
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(obstacle.x + obstacle.width * 0.3, obstacle.y + i * 10);
          ctx.lineTo(obstacle.x + obstacle.width * 0.3 - 5, obstacle.y + i * 10 - 3);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(obstacle.x + obstacle.width * 0.7, obstacle.y + i * 10);
          ctx.lineTo(obstacle.x + obstacle.width * 0.7 + 5, obstacle.y + i * 10 - 3);
          ctx.stroke();
        }
      } else {
        // Draw rock
        ctx.fillStyle = '#8B7355';
        ctx.beginPath();
        ctx.ellipse(
          obstacle.x + obstacle.width / 2,
          obstacle.y + obstacle.height / 2,
          obstacle.width / 2,
          obstacle.height / 2,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Rock texture detail
        ctx.fillStyle = '#6B5345';
        ctx.beginPath();
        ctx.ellipse(
          obstacle.x + obstacle.width * 0.3,
          obstacle.y + obstacle.height * 0.3,
          obstacle.width * 0.15,
          obstacle.height * 0.15,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      ctx.restore();
    };

    const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
      ctx.save();
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawUI = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      if (gameState !== 'playing') return;

      const llama = llamaRef.current!;

      // Triple jump cooldown indicator (bottom-left)
      const cooldownX = 20;
      const cooldownY = canvas.height - 50;
      const cooldownSize = 35;

      // Background circle
      ctx.beginPath();
      ctx.arc(cooldownX + cooldownSize / 2, cooldownY + cooldownSize / 2, cooldownSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Cooldown progress
      if (llama.tripleJumpCooldown > 0) {
        const progress = 1 - llama.tripleJumpCooldown / llama.tripleJumpMaxCooldown;
        ctx.beginPath();
        ctx.arc(
          cooldownX + cooldownSize / 2,
          cooldownY + cooldownSize / 2,
          cooldownSize / 2 - 4,
          -Math.PI / 2,
          -Math.PI / 2 + Math.PI * 2 * progress
        );
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 5;
        ctx.stroke();

        // Countdown text
        const secondsLeft = Math.ceil(llama.tripleJumpCooldown / 1000);
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(secondsLeft.toString(), cooldownX + cooldownSize / 2, cooldownY + cooldownSize / 2);
      } else {
        // Ready indicator - pulsing lightning bolt
        const pulseScale = 1 + Math.sin(Date.now() / 200) * 0.15;
        ctx.save();
        ctx.translate(cooldownX + cooldownSize / 2, cooldownY + cooldownSize / 2);
        ctx.scale(pulseScale, pulseScale);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', 0, 0);
        ctx.restore();
      }

      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    };

    // Render loop
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationId: number;

      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBackground(ctx, canvas);

        // Read directly from refs to get latest values
        const obstacles = obstaclesRef.current || [];
        const particles = particlesRef.current || [];

        obstacles.forEach((obstacle) => drawObstacle(ctx, obstacle));
        particles.forEach((particle) => drawParticle(ctx, particle));
        drawLlama(ctx);
        drawUI(ctx, canvas);

        animationId = requestAnimationFrame(render);
      };

      animationId = requestAnimationFrame(render);

      return () => cancelAnimationFrame(animationId);
    });  // Remove dependencies - we want this to always use the latest props

    // Handle clicks
    const handleClick = () => {
      if (gameState === 'playing') {
        onJump();
      }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      e.preventDefault();
      if (gameState === 'playing') {
        onJump();
      }
    };

    return (
      <canvas
        ref={canvasRef}
        width={900}
        height={500}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        className="absolute top-0 left-0 cursor-pointer"
      />
    );
  }
);

GameCanvas.displayName = 'GameCanvas';

export default GameCanvas;
