
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Target, Crosshair } from "lucide-react";

interface AimingGameProps {
  onFinish: (score: number, time: number) => void;
}

const reactionTimeBenchmarks = {
  worldClass: 230,
  excellent: 260,
  good: 300,
  average: 350,
  slow: 400,
  verySlow: 500
};

const AimingGame: React.FC<AimingGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [targets, setTargets] = useState<Array<{ id: number; x: number; y: number; size: number; spawnTime: number }>>([]);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [targetsHit, setTargetsHit] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [missedTargets, setMissedTargets] = useState<number>(0);


  // Add a ref to track gameOver for use in setTimeout
  const gameOverRef = useRef(false);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);

  const generateTarget = useCallback(() => {
    const id = Date.now();
    const size = 40 + Math.random() * 40; // 40-80px
    const x = size/2 + Math.random() * (320 - size); // Keep within bounds
    const y = size/2 + Math.random() * (320 - size);
    const spawnTime = Date.now();
    
    const newTarget = { id, x, y, size, spawnTime };
    
    setTargets(prev => [...prev, newTarget]);
    
    // Remove target after 3 seconds if not hit (longer lifespan)
    setTimeout(() => {
      setTargets(prev => {
        if (prev.some(t => t.id === id)) {
          // Only increment missedTargets if game is not over
          if (!gameOverRef.current) {
            setMissedTargets(prev => prev + 1);
          }
        }
        return prev.filter(t => t.id !== id);
      });
    }, 3000);
  }, []);

  useEffect(() => {
    setGameStartTime(Date.now());
    
    // Generate targets every 1200ms (slower than before)
    const interval = setInterval(generateTarget, 1200);
    
    return () => clearInterval(interval);
  }, [generateTarget]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setGameOver(true);
      setGameEndTime(Date.now());
    }
  }, [timeLeft]);

  const handleTargetHit = (targetId: number, targetSize: number) => {
    // Find the target to get its spawn time
    const target = targets.find(t => t.id === targetId);
    if (!target) return;
    
    // Calculate actual reaction time
    const reactionTime = Date.now() - target.spawnTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    
    // Remove the hit target
    setTargets(prev => prev.filter(t => t.id !== targetId));
    
    // Calculate score based on reaction time and target size
    const timeBonus = Math.max(0, 2000 - reactionTime) / 20; // Faster = more bonus
    const sizeBonus = Math.max(1, 80 - targetSize) / 2; // Smaller = more bonus
    const baseScore = Math.floor(50 + timeBonus + sizeBonus);
    
    setScore(prevScore => prevScore + baseScore);
    setTargetsHit(prev => prev + 1);
  };

  // Calculate stats
  const calculateStats = () => {
    if (reactionTimes.length === 0) return null;
    const sum = reactionTimes.reduce((a, b) => a + b, 0);
    const average = Math.round(sum / reactionTimes.length);
    const best = Math.min(...reactionTimes);
    const worst = Math.max(...reactionTimes);
    const vsWorldClass = average - reactionTimeBenchmarks.worldClass;
    const percentageSlower = Math.round((vsWorldClass / reactionTimeBenchmarks.worldClass) * 100);
    let performanceRating = "";
    if (average <= reactionTimeBenchmarks.worldClass) {
      performanceRating = "World Class";
    } else if (average <= reactionTimeBenchmarks.excellent) {
      performanceRating = "Excellent";
    } else if (average <= reactionTimeBenchmarks.good) {
      performanceRating = "Good";
    } else if (average <= reactionTimeBenchmarks.average) {
      performanceRating = "Average";
    } else if (average <= reactionTimeBenchmarks.slow) {
      performanceRating = "Slow";
    } else {
      performanceRating = "Very Slow";
    }
    return {
      average,
      best,
      worst,
      vsWorldClass,
      percentageSlower,
      performanceRating,
      benchmarks: reactionTimeBenchmarks
    };
  };

  if (gameOver) {
    const totalTimeMs = gameEndTime && gameStartTime ? gameEndTime - gameStartTime : 0;
    const stats = calculateStats();
    return (
      <div className="w-full min-h-[calc(100vh-10rem)] flex items-center justify-center bg-luxury-black p-6">
        <div className="w-full max-w-md bg-luxury-black rounded-2xl shadow-2xl border-2 border-luxury-gold p-6 flex flex-col items-center animate-fade-in">
          {/* Best Results & Tips Section */}
          <div className="w-full mb-4 p-3 rounded-lg bg-luxury-gold/10 border border-luxury-gold/40 text-center">
            <div className="text-base font-semibold text-luxury-gold mb-1">How to Get the Best Results</div>
            <div className="text-sm text-luxury-white/80 mb-1">
              Tap targets as quickly as possible. Smaller targets give more points! Speed and accuracy matter.
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}ms average reaction
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Aiming Results</div>
          </div>
          <div className="w-full flex flex-col gap-2 mb-4">
            <div className="flex justify-between text-lg">
              <span className="text-luxury-white/80">Final Score:</span>
              <span className="font-bold text-luxury-gold">{score}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Targets Hit:</span>
              <span>{targetsHit}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Missed Targets:</span>
              <span className="text-red-400">{missedTargets}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Avg. Reaction:</span>
              <span>{stats?.average ?? 0}ms</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Best:</span>
              <span>{stats?.best ?? 0}ms</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Worst:</span>
              <span>{stats?.worst ?? 0}ms</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Total Time:</span>
              <span>{(totalTimeMs / 1000).toFixed(2)}s</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Performance:</span>
              <span className="font-semibold text-luxury-gold">{stats?.performanceRating}</span>
            </div>
          </div>
          <button
            className="text-xs text-luxury-gold underline mb-2 focus:outline-none"
            onClick={() => setShowDetails((v) => !v)}
          >
            {showDetails ? "Hide Details" : "Show Detailed Stats"}
          </button>
          {showDetails && (
            <div className="w-full bg-luxury-black/80 rounded-lg border border-luxury-gold/30 p-3 mb-2 max-h-48 overflow-y-auto animate-fade-in">
              <div className="text-sm text-luxury-gold mb-1 font-semibold">Reaction Times (ms):</div>
              <div className="flex flex-wrap gap-2 text-xs text-luxury-white/80">
                {reactionTimes.map((t, i) => (
                  <span key={i} className="px-2 py-1 bg-luxury-gold/10 rounded">{t}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-4 mt-4 w-full">
            <button
              className="flex-1 px-4 py-2 bg-luxury-gold text-luxury-black font-semibold rounded hover:bg-yellow-400 transition"
              onClick={() => window.location.reload()}
            >
              Play Again
            </button>
            <button
              className="flex-1 px-4 py-2 bg-luxury-white text-luxury-black font-semibold rounded hover:bg-luxury-gold transition"
              onClick={() => navigator.share && navigator.share({ title: 'Aiming Results', text: `Score: ${score}, Hits: ${targetsHit}, Avg: ${stats?.average ?? 0}ms`, url: window.location.href })}
            >
              Share
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-xl font-bold text-luxury-gold">Score: {score}</div>
        <div className="text-sm text-luxury-white/70">
          Time: {timeLeft}s | Hits: {targetsHit}
        </div>
      </div>
      
      {/* Game Area */}
      <div className="relative w-full max-w-sm h-80 bg-luxury-black border-2 border-luxury-white/20 rounded-xl overflow-hidden shadow-2xl">
        
        {/* Targets */}
        {targets.map((target) => (
          <button
            key={target.id}
            className="absolute rounded-full bg-gradient-to-br from-luxury-gold to-yellow-400 hover:from-yellow-400 hover:to-luxury-gold transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center shadow-lg border-2 border-white/20"
            style={{
              left: `${target.x}px`,
              top: `${target.y}px`,
              width: `${target.size}px`,
              height: `${target.size}px`,
              transform: 'translate(-50%, -50%)',
              touchAction: 'manipulation', // Optimize for mobile touch
            }}
            onClick={() => handleTargetHit(target.id, target.size)}
            onTouchStart={(e) => {
              e.preventDefault(); // Prevent double-tap zoom on mobile
              handleTargetHit(target.id, target.size);
            }}
          >
            <Target className="h-1/2 w-1/2 text-luxury-black drop-shadow-sm" />
          </button>
        ))}
      </div>
      
      {/* Instructions */}
      <div className="text-center space-y-2">
        <div className="text-lg font-semibold text-luxury-gold">Tap Targets Fast!</div>
        <div className="text-xs text-luxury-white/60 max-w-sm">
          Smaller targets and faster reactions give more points. Test your speed and accuracy!
        </div>
      </div>
    </div>
  );
};

export default AimingGame;
