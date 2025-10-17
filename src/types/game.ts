export type GameState = 'menu' | 'playing' | 'gameover';

export type ObstacleType = 'cactus' | 'rock';

export interface LlamaCharacter {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  velocityX: number;
  jumping: boolean;
  doubleJumpAvailable: boolean;
  tripleJumpAvailable: boolean;
  tripleJumpCooldown: number;
  tripleJumpMaxCooldown: number;
  jumpPower: number;
  gravity: number;
  groundY: number;
  legAnimation: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  passed: boolean;
}

export interface Cloud {
  x: number;
  y: number;
  speed: number;
  size: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface Background {
  x: number;
  speed: number;
  color: string;
}

export type SoundType = 'jump' | 'score' | 'gameOver' | 'collect';
