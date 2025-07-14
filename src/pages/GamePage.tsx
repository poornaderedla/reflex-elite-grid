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
import LongestLineGame from "@/games/LongestLineGame";
import MemoryGame from "@/games/MemoryGame";
import PeripheralVisionGame from "@/games/PeripheralVisionGame";
import F1StartLightsGame from "@/games/F1StartLightsGame";
import SpatialImaginationGame from "@/games/SpatialImaginationGame";
import SixDotsGame from "@/games/SixDotsGame";
import ClickLimitGame from "@/games/ClickLimitGame";
import EqualNumbersGame from "@/games/EqualNumbersGame";
import DotsCountGame from "@/games/DotsCountGame";
import SameShapesGame from "@/games/SameShapesGame";
import ColorFramesCountGame from "@/games/ColorFramesCountGame";
import More100Game from "@/games/More100Game";
import NumbersOrderGame from "@/games/NumbersOrderGame";
import RotationGame from "@/games/RotationGame";

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
  longestLine: 2.00,        // 2s average for line identification
  memory: 45.00,           // 45s average for memory matching
  peripheralVision: 3.00,   // 3s average for peripheral number identification
  f1StartLights: 0.25,        // 0.25s average F1 driver reaction time
  spatialImagination: 3.00,   // 3s average for spatial pattern recognition
  sixDots: 2.00,             // 2s average per sequence item
  clickLimit: 8.00,          // 8s average to complete click challenges
  equalNumbers: 2.50,        // 2.5s average to find matching numbers
  dotsCount: 4.00,           // 4s average including counting time
  sameShapes: 3.00,          // 3s average to identify matching shapes
  colorFramesCount: 5.00,    // 5s average including observation time
  more100: 6.00,             // 6s average for mental math calculation
  numbersOrder: 5.00,
  rotation: 3.50,
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
      case "longestLine":
        return <LongestLineGame onFinish={handleGameEnd} />;
      case "memory":
        return <MemoryGame onFinish={handleGameEnd} />;
      case "peripheralVision":
        return <PeripheralVisionGame onFinish={handleGameEnd} />;
      case "f1StartLights":
        return <F1StartLightsGame onFinish={handleGameEnd} />;
      case "spatialImagination":
        return <SpatialImaginationGame onFinish={handleGameEnd} />;
      case "sixDots":
        return <SixDotsGame onFinish={handleGameEnd} />;
      case "clickLimit":
        return <ClickLimitGame onFinish={handleGameEnd} />;
      case "equalNumbers":
        return <EqualNumbersGame onFinish={handleGameEnd} />;
      case "dotsCount":
        return <DotsCountGame onFinish={handleGameEnd} />;
      case "sameShapes":
        return <SameShapesGame onFinish={handleGameEnd} />;
      case "colorFramesCount":
        return <ColorFramesCountGame onFinish={handleGameEnd} />;
      case "more100":
        return <More100Game onFinish={handleGameEnd} />;
      case "numbersOrder":
        return <NumbersOrderGame onFinish={handleGameEnd} />;
      case "rotation":
        return <RotationGame onFinish={handleGameEnd} />;
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
