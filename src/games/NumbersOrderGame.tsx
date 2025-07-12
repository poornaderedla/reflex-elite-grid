
import React, { useState, useEffect, useCallback } from "react";

interface NumbersOrderGameProps {
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

const NumbersOrderGame: React.FC<NumbersOrderGameProps> = ({ onFinish }) => {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [startTime, setStartTime] = useState(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [wrongClicks, setWrongClicks] = useState<number>(0);

  const shuffle = (array: number[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  
  const generateNumbers = useCallback(() => {
    const newNumbers = Array.from({ length: 9 }, (_, i) => i + 1);
    setNumbers(shuffle(newNumbers));
    setCurrentNumber(1);
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    generateNumbers();
  }, [generateNumbers]);

  const handleClick = (num: number) => {
    const reactionTime = Date.now() - startTime;
    
    if (num === currentNumber) {
      setReactionTimes(prev => [...prev, reactionTime]);
      
      if (num === 9) {
        const timeTaken = Date.now() - startTime;
        const score = Math.max(0, Math.floor(10000 - timeTaken));
        setGameOver(true);
        setGameEndTime(Date.now());
      } else {
        setCurrentNumber(currentNumber + 1);
        setStartTime(Date.now());
      }
    } else {
      setWrongClicks(prev => prev + 1);
    }
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
    const totalTimeMs = gameEndTime && startTime ? gameEndTime - startTime : 0;
    const finalScore = Math.max(0, Math.floor(10000 - totalTimeMs));
    const stats = calculateStats();
    return (
      <div className="w-full min-h-[calc(100vh-10rem)] flex items-center justify-center bg-luxury-black p-6">
        <div className="w-full max-w-md bg-luxury-black rounded-2xl shadow-2xl border-2 border-luxury-gold p-6 flex flex-col items-center animate-fade-in">
          {/* Best Results & Tips Section */}
          <div className="w-full mb-4 p-3 rounded-lg bg-luxury-gold/10 border border-luxury-gold/40 text-center">
            <div className="text-base font-semibold text-luxury-gold mb-1">How to Get the Best Results</div>
            <div className="text-sm text-luxury-white/80 mb-1">
              Click numbers in order from 1 to 9 as quickly as possible. Speed and accuracy matter!
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}ms average reaction
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Numbers Order Results</div>
          </div>
          <div className="w-full flex flex-col gap-2 mb-4">
            <div className="flex justify-between text-lg">
              <span className="text-luxury-white/80">Final Score:</span>
              <span className="font-bold text-luxury-gold">{finalScore}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Numbers Found:</span>
              <span>{reactionTimes.length}/9</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Wrong Clicks:</span>
              <span className="text-red-400">{wrongClicks}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Avg. Click Time:</span>
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
              <div className="text-sm text-luxury-gold mb-1 font-semibold">Click Times (ms):</div>
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
              onClick={() => navigator.share && navigator.share({ title: 'Numbers Order Results', text: `Score: ${finalScore}, Time: ${(totalTimeMs / 1000).toFixed(2)}s, Avg: ${stats?.average ?? 0}ms`, url: window.location.href })}
            >
              Share
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="text-lg">Find number: <span className="text-luxury-gold font-bold">{currentNumber}</span></div>
        <div className="text-sm text-luxury-white/70">Click numbers in order from 1 to 9</div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-96">
        {numbers.map((number, index) => (
          <button
            key={index}
            onClick={() => handleClick(number)}
            className={`
              w-24 h-24 bg-luxury-black border-2 rounded-lg text-2xl font-bold transition-all
              ${number === currentNumber 
                ? 'border-luxury-gold text-luxury-gold bg-luxury-gold/10' 
                : 'border-luxury-white/20 text-luxury-white hover:border-luxury-gold/50 hover:bg-luxury-gold/10'
              }
              hover:scale-105 active:scale-95
            `}
          >
            {number}
          </button>
        ))}
      </div>

      <div className="text-center text-xs text-luxury-white/50">
        Click numbers in ascending order as fast as possible
      </div>
    </div>
  );
};

export default NumbersOrderGame;
