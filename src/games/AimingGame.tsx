
import React, { useState, useEffect, useCallback } from "react";
import { Target, Crosshair } from "lucide-react";

interface AimingGameProps {
  onFinish: (score: number, time: number) => void;
}

const AimingGame: React.FC<AimingGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [targets, setTargets] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [targetsHit, setTargetsHit] = useState<number>(0);

  const generateTarget = useCallback(() => {
    const id = Date.now();
    const size = 40 + Math.random() * 40; // 40-80px
    const x = size/2 + Math.random() * (320 - size); // Keep within bounds
    const y = size/2 + Math.random() * (320 - size);
    
    const newTarget = { id, x, y, size };
    
    setTargets(prev => [...prev, newTarget]);
    
    // Remove target after 2 seconds if not hit
    setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== id));
    }, 2000);
  }, []);

  useEffect(() => {
    setGameStartTime(Date.now());
    
    // Generate targets every 800ms
    const interval = setInterval(generateTarget, 800);
    
    return () => clearInterval(interval);
  }, [generateTarget]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onFinish(score, Date.now() - gameStartTime);
    }
  }, [timeLeft, score, gameStartTime, onFinish]);

  const handleTargetHit = (targetId: number, targetSize: number) => {
    // Remove the hit target
    setTargets(prev => prev.filter(t => t.id !== targetId));
    
    // Calculate score based on target size (smaller = more points)
    const baseScore = Math.floor(1000 / targetSize * 10);
    setScore(prevScore => prevScore + baseScore);
    setTargetsHit(prev => prev + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-4">
      <div className="text-center space-y-2">
        <div className="text-lg">Score: {score}</div>
        <div className="text-sm text-luxury-white/70">
          Time: {timeLeft}s | Hits: {targetsHit}
        </div>
      </div>
      
      <div className="relative w-80 h-80 bg-luxury-black border-2 border-luxury-white/20 rounded-lg overflow-hidden">
        {/* Crosshair in center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Crosshair className="h-6 w-6 text-luxury-white/30" />
        </div>
        
        {/* Targets */}
        {targets.map((target) => (
          <button
            key={target.id}
            className="absolute rounded-full bg-luxury-gold/80 hover:bg-luxury-gold transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
            style={{
              left: `${target.x}px`,
              top: `${target.y}px`,
              width: `${target.size}px`,
              height: `${target.size}px`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={() => handleTargetHit(target.id, target.size)}
          >
            <Target className="h-1/2 w-1/2 text-luxury-black" />
          </button>
        ))}
      </div>
      
      <div className="text-center text-xs text-luxury-white/50">
        Tap targets quickly! Smaller targets = more points
      </div>
    </div>
  );
};

export default AimingGame;
