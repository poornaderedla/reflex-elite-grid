
import React, { useState, useEffect, useCallback } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

interface SwipeGameProps {
  onFinish: (score: number, time: number) => void;
}

type Direction = 'up' | 'down' | 'left' | 'right';

const SwipeGame: React.FC<SwipeGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [currentDirection, setCurrentDirection] = useState<Direction | null>(null);
  const [rounds, setRounds] = useState<number>(0);
  const [showDirection, setShowDirection] = useState<boolean>(false);
  const [directionTime, setDirectionTime] = useState<number>(0);

  const totalRounds = 12;
  const directions: Direction[] = ['up', 'down', 'left', 'right'];

  const getDirectionIcon = (direction: Direction) => {
    switch (direction) {
      case 'up': return <ArrowUp className="h-16 w-16" />;
      case 'down': return <ArrowDown className="h-16 w-16" />;
      case 'left': return <ArrowLeft className="h-16 w-16" />;
      case 'right': return <ArrowRight className="h-16 w-16" />;
    }
  };

  const showNewDirection = useCallback(() => {
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    setCurrentDirection(randomDirection);
    setShowDirection(true);
    setDirectionTime(Date.now());
    
    // Auto-advance if no swipe within 2 seconds
    setTimeout(() => {
      if (showDirection) {
        nextRound();
      }
    }, 2000);
  }, [showDirection]);

  const nextRound = useCallback(() => {
    setShowDirection(false);
    setCurrentDirection(null);
    setRounds(prevRounds => {
      const newRounds = prevRounds + 1;
      if (newRounds >= totalRounds) {
        onFinish(score, Date.now() - gameStartTime);
        return prevRounds;
      } else {
        // Start next direction after delay
        setTimeout(() => {
          const delay = Math.random() * 1500 + 1000; // 1-2.5 seconds
          setTimeout(showNewDirection, delay);
        }, 500);
        return newRounds;
      }
    });
  }, [score, gameStartTime, onFinish, showNewDirection]);

  useEffect(() => {
    setGameStartTime(Date.now());
    // Start first direction
    const delay = Math.random() * 1500 + 1000;
    setTimeout(showNewDirection, delay);
  }, [showNewDirection]);

  const handleSwipe = (direction: Direction) => {
    if (!showDirection || !currentDirection) return;
    
    if (direction === currentDirection) {
      // Correct swipe
      const reactionTime = Date.now() - directionTime;
      const points = Math.max(0, Math.floor(800 - reactionTime / 3));
      setScore(prevScore => prevScore + points);
      nextRound();
    } else {
      // Wrong swipe - penalty
      setScore(prevScore => Math.max(0, prevScore - 100));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-8">
      <div className="text-center space-y-2">
        <div className="text-lg">Score: {score}</div>
        <div className="text-sm text-luxury-white/70">
          Round {rounds + 1}/{totalRounds}
        </div>
      </div>
      
      <div className="relative w-80 h-80 rounded-xl border-2 border-luxury-white/20 bg-luxury-black flex items-center justify-center">
        {showDirection && currentDirection ? (
          <div className="text-luxury-gold animate-pulse">
            {getDirectionIcon(currentDirection)}
          </div>
        ) : (
          <div className="text-luxury-white/30">
            <div className="text-lg">Get Ready...</div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-4 w-48">
        <div></div>
        <button
          onClick={() => handleSwipe('up')}
          className="btn-outline h-12 w-12 p-0"
          disabled={!showDirection}
        >
          <ArrowUp className="h-6 w-6" />
        </button>
        <div></div>
        
        <button
          onClick={() => handleSwipe('left')}
          className="btn-outline h-12 w-12 p-0"
          disabled={!showDirection}
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => handleSwipe('down')}
          className="btn-outline h-12 w-12 p-0"
          disabled={!showDirection}
        >
          <ArrowDown className="h-6 w-6" />
        </button>
        <button
          onClick={() => handleSwipe('right')}
          className="btn-outline h-12 w-12 p-0"
          disabled={!showDirection}
        >
          <ArrowRight className="h-6 w-6" />
        </button>
        
        <div></div>
        <div className="text-xs text-luxury-white/50 text-center">
          Tap the arrow shown above
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default SwipeGame;
