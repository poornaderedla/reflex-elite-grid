export type GameType = 
  | "colorChange" 
  | "catchBall" 
  | "findNumber" 
  | "findColor" 
  | "colorText" 
  | "colorCatch" 
  | "reflexTap" 
  | "patternMemory"
  | "math"
  | "sound" 
  | "sensation"
  | "swipe"
  | "excessCells"
  | "aiming"
  | "longestLine"
  | "memory"
  | "peripheralVision"
  | "f1StartLights"
  | "spatialImagination"
  | "sixDots"
  | "clickLimit"
  | "equalNumbers"
  | "dotsCount"
  | "sameShapes"
  | "colorFramesCount"
  | "fastClick" 
  | "more100"
  | "shake"
  | "numbersOrder"
  | "selection"
  | "swipe2"
  | "colorChange2"
  | "rotation";

export interface Game {
  id: GameType;
  name: string;
  description: string;
  instructions: string;
  icon: string;
  highScore?: number;
  bestTime?: number;
}

export interface GameResult {
  gameId: GameType;
  score: number;
  time: number;
  date: string;
  isHighScore: boolean;
}

export type GameStatus = "idle" | "countdown" | "playing" | "finished";
