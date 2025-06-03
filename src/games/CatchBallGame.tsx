
import React, { useState, useEffect, useRef, useCallback } from "react";

interface CatchBallGameProps {
  onFinish: (score: number, time: number) => void;
}

const CatchBallGame: React.FC<CatchBallGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [misses, setMisses] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 0 });
  const [ballActive, setBallActive] = useState<boolean>(false);
  const [ballSize, setBallSize] = useState<number>(50);
  const [speed, setSpeed] = useState<number>(2);
  const containerRef = useRef<HTMLDivElement>(null);

  const maxMisses = 5;
  const animationFrameRef = useRef<number>(0);
  
  useEffect(() => {
    setGameStartTime(Date.now());
    launchBall();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (score > 0 && score % 5 === 0) {
      setSpeed(prevSpeed => Math.min(prevSpeed + 0.5, 6));
      setBallSize(prevSize => Math.max(prevSize - 2, 30));
    }
  }, [score]);
  
  const launchBall = useCallback(() => {
    if (!containerRef.current) return;
    
    const randomX = Math.random() * 80 + 10;
    setBallPosition({ x: randomX, y: 0 });
    setBallActive(true);
    
    let y = 0;
    const animate = () => {
      y += speed;
      setBallPosition({ x: randomX, y });
      
      if (y >= 100) {
        setMisses(prev => {
          const newMisses = prev + 1;
          if (newMisses >= maxMisses) {
            onFinish(score, Date.now() - gameStartTime);
          } else {
            setTimeout(launchBall, 500);
          }
          return newMisses;
        });
        setBallActive(false);
        return;
      }
      
      if (ballActive) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [speed, score, gameStartTime, ballActive, onFinish]);
  
  const handleBallClick = useCallback(() => {
    if (!ballActive) return;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    const heightBonus = 100 - ballPosition.y;
    const newPoints = Math.floor(10 + (heightBonus / 10) + speed * 2);
    
    setScore(prevScore => prevScore + newPoints);
    setBallActive(false);
    
    setTimeout(launchBall, 500);
  }, [ballActive, ballPosition.y, speed, launchBall]);

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-4">
      <div 
        ref={containerRef}
        className="relative w-full max-w-md h-96 overflow-hidden bg-luxury-black border border-luxury-white/20 rounded-lg"
      >
        <div className="absolute left-0 right-0 top-0 flex justify-between p-3 text-luxury-white text-sm">
          <div className="rounded-md bg-luxury-black/70 px-2 py-1 backdrop-blur-sm border border-luxury-white/10">
            Score: {score}
          </div>
          <div className="rounded-md bg-luxury-black/70 px-2 py-1 backdrop-blur-sm border border-luxury-white/10">
            Misses: {misses}/{maxMisses}
          </div>
        </div>
        
        {ballActive && (
          <button
            className="absolute rounded-full bg-luxury-gold transition-transform hover:scale-105 focus:outline-none touch-target"
            style={{
              left: `${ballPosition.x}%`,
              top: `${ballPosition.y}%`,
              transform: 'translate(-50%, -50%)',
              width: `${ballSize}px`,
              height: `${ballSize}px`,
            }}
            onClick={handleBallClick}
          />
        )}
        
        {misses >= maxMisses && (
          <div className="absolute inset-0 flex items-center justify-center bg-luxury-black/80 backdrop-blur-sm">
            <div className="text-xl font-bold text-luxury-white">Game Over!</div>
          </div>
        )}
      </div>
      
      <div className="text-center text-luxury-white/70 text-sm">
        Catch the falling balls! Speed increases every 5 points.
      </div>
    </div>
  );
};

export default CatchBallGame;
