
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "@/contexts/GameContext";
import Layout from "@/components/layout/Layout";
import GameContainer from "@/components/games/GameContainer";
import GameResult from "@/components/games/GameResult";
import { GameType } from "@/types/game";
import ColorChangeGame from "@/games/ColorChangeGame";
import CatchBallGame from "@/games/CatchBallGame";
import FindNumberGame from "@/games/FindNumberGame";
import FindColorGame from "@/games/FindColorGame";
import ColorTextGame from "@/games/ColorTextGame";
import ColorCatchGame from "@/games/ColorCatchGame";
import ReflexTapGame from "@/games/ReflexTapGame";
import PatternMemoryGame from "@/games/PatternMemoryGame";
import MathGame from "@/games/MathGame";
import SoundGame from "@/games/SoundGame";
import SensationGame from "@/games/SensationGame";
import SwipeGame from "@/games/SwipeGame";
import ExcessCellsGame from "@/games/ExcessCellsGame";
import AimingGame from "@/games/AimingGame";

const STANDARD_BEST_AVERAGE_TIMINGS: Record<string, number> = {
  colorChange: 0.20,      // 0.20s world average for "Color Change"
  catchBall: 0.18,        // 0.18s for "Catch the Ball"
  findNumber: 4.00,       // 4s standard average for grid
  findColor: 3.50,        // 3.5s for colors
  colorText: 4.00,        // 4s for color text
  colorCatch: 27.00,      // 27s for color catch
  reflexTap: 5.00,        // 5s (total for whole game or for all taps)
  patternMemory: 2.50,    // 2.5s per pattern
  math: 35.00,            // 35s for math equations
  sound: 0.25,            // 0.25s for sound reaction
  sensation: 0.30,        // 0.30s for tactile sensation
  swipe: 0.40,            // 0.40s for swipe reaction
  excessCells: 25.00,     // 25s for excess cells
  aiming: 0.50,           // 0.50s for aiming targets
};

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { games, getGameHighScore, saveGameResult } = useGame();
  const [showResults, setShowResults] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [isHighScore, setIsHighScore] = useState(false);
  const navigate = useNavigate();

  const game = games.find(g => g.id === gameId);
  
  if (!game) {
    return <div>Game not found</div>;
  }

  const handleGameStart = () => {
    setShowResults(false);
  };

  const handleGameEnd = (score: number, time: number) => {
    const highScore = getGameHighScore(game.id as GameType) || 0;
    const newHighScore = score > highScore;
    
    const result = {
      gameId: game.id as GameType,
      score,
      time,
      date: new Date().toISOString(),
      isHighScore: newHighScore
    };
    
    saveGameResult(result);
    
    setGameScore(score);
    setGameTime(time);
    setIsHighScore(newHighScore);
    setShowResults(true);
  };

  const handleRestart = () => {
    setShowResults(false);
    navigate(0);
  };

  const renderGame = () => {
    switch (game.id) {
      case "colorChange":
        return <ColorChangeGame onFinish={handleGameEnd} />;
      case "catchBall":
        return <CatchBallGame onFinish={handleGameEnd} />;
      case "findNumber":
        return <FindNumberGame onFinish={handleGameEnd} />;
      case "findColor":
        return <FindColorGame onFinish={handleGameEnd} />;
      case "colorText":
        return <ColorTextGame onFinish={handleGameEnd} />;
      case "colorCatch":
        return <ColorCatchGame onFinish={handleGameEnd} />;
      case "reflexTap":
        return <ReflexTapGame onFinish={handleGameEnd} />;
      case "patternMemory":
        return <PatternMemoryGame onFinish={handleGameEnd} />;
      case "math":
        return <MathGame onFinish={handleGameEnd} />;
      case "sound":
        return <SoundGame onFinish={handleGameEnd} />;
      case "sensation":
        return <SensationGame onFinish={handleGameEnd} />;
      case "swipe":
        return <SwipeGame onFinish={handleGameEnd} />;
      case "excessCells":
        return <ExcessCellsGame onFinish={handleGameEnd} />;
      case "aiming":
        return <AimingGame onFinish={handleGameEnd} />;
      default:
        return <div>Game component not available</div>;
    }
  };

  const standardBestAverage = STANDARD_BEST_AVERAGE_TIMINGS[game.id] ?? undefined;

  return (
    <Layout>
      {showResults ? (
        <GameResult
          title={game.name}
          score={gameScore}
          time={gameTime}
          isHighScore={isHighScore}
          onRestart={handleRestart}
          standardBestAverage={standardBestAverage}
        />
      ) : (
        <GameContainer
          title={game.name}
          instructions={game.instructions}
          onGameStart={handleGameStart}
          onGameEnd={handleGameEnd}
        >
          {renderGame()}
        </GameContainer>
      )}
    </Layout>
  );
};

export default GamePage;
