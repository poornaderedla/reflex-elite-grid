
import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface ExcessCellsGameProps {
  onFinish: (score: number, time: number) => void;
}

const ExcessCellsGame: React.FC<ExcessCellsGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [grid, setGrid] = useState<string[]>([]);
  const [excessCells, setExcessCells] = useState<Set<number>>(new Set());
  const [rounds, setRounds] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [gameOver, setGameOver] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);

  const totalRounds = 8;
  const gridSize = 6; // 6x6 grid
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

  const reactionTimeBenchmarks = {
    worldClass: 3.0,
    excellent: 4.0,
    good: 5.0,
    average: 6.0,
    slow: 7.0,
    verySlow: 8.0
  };

  const calculateStats = () => {
    if (reactionTimes.length === 0) return null;
    
    const average = Math.round((reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) * 100) / 100;
    const best = Math.min(...reactionTimes);
    const worst = Math.max(...reactionTimes);
    const accuracy = correctAnswers > 0 ? Math.round((correctAnswers / (correctAnswers + wrongAnswers)) * 100) : 0;
    
    let performanceRating = 'Very Slow';
    let ratingColor = 'text-red-400';
    
    if (average <= reactionTimeBenchmarks.worldClass) {
      performanceRating = 'World Class';
      ratingColor = 'text-purple-400';
    } else if (average <= reactionTimeBenchmarks.excellent) {
      performanceRating = 'Excellent';
      ratingColor = 'text-blue-400';
    } else if (average <= reactionTimeBenchmarks.good) {
      performanceRating = 'Good';
      ratingColor = 'text-green-400';
    } else if (average <= reactionTimeBenchmarks.average) {
      performanceRating = 'Average';
      ratingColor = 'text-yellow-400';
    } else if (average <= reactionTimeBenchmarks.slow) {
      performanceRating = 'Slow';
      ratingColor = 'text-orange-400';
    }
    
    return {
      average,
      best,
      worst,
      accuracy,
      performanceRating,
      ratingColor,
      benchmarks: reactionTimeBenchmarks
    };
  };

  const generateGrid = useCallback(() => {
    const newGrid: string[] = [];
    const colorCounts: { [key: string]: number } = {};
    const targetCount = Math.floor((gridSize * gridSize) / colors.length);
    
    // Fill grid with balanced colors
    colors.forEach(color => {
      colorCounts[color] = targetCount;
      for (let i = 0; i < targetCount; i++) {
        newGrid.push(color);
      }
    });
    
    // Add some excess cells of random colors
    const excessCount = 6 + Math.floor(Math.random() * 4); // 6-9 excess
    const excessIndices = new Set<number>();
    
    for (let i = 0; i < excessCount; i++) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      newGrid.push(randomColor);
      excessIndices.add(newGrid.length - 1);
    }
    
    // Shuffle the grid
    for (let i = newGrid.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newGrid[i], newGrid[j]] = [newGrid[j], newGrid[i]];
      
      // Update excess indices after shuffle
      if (excessIndices.has(i)) {
        excessIndices.delete(i);
        excessIndices.add(j);
      } else if (excessIndices.has(j)) {
        excessIndices.delete(j);
        excessIndices.add(i);
      }
    }
    
    setGrid(newGrid);
    setExcessCells(excessIndices);
    setRoundStartTime(Date.now());
  }, []);

  useEffect(() => {
    setGameStartTime(Date.now());
    generateGrid();
  }, [generateGrid]);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft <= 0 && !gameOver) {
      setGameOver(true);
      setGameEndTime(Date.now());
    }
  }, [timeLeft, gameOver]);

  const handleCellClick = (index: number) => {
    if (excessCells.has(index)) {
      // Correct - remove excess cell
      const reactionTime = (Date.now() - roundStartTime) / 1000;
      setReactionTimes(prev => [...prev, reactionTime]);
      setCorrectAnswers(c => c + 1);
      setScore(prevScore => prevScore + 100);
      setExcessCells(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        
        // Check if all excess cells removed
        if (newSet.size === 0) {
          setRounds(prevRounds => {
            const newRounds = prevRounds + 1;
            if (newRounds >= totalRounds) {
              setGameOver(true);
              setGameEndTime(Date.now());
            } else {
              setTimeout(generateGrid, 1000);
            }
            return newRounds;
          });
        }
        
        return newSet;
      });
    } else {
      // Wrong - penalty
      setWrongAnswers(w => w + 1);
      setScore(prevScore => Math.max(0, prevScore - 50));
    }
  };

  const getCellColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
    };
    return colorMap[color] || 'bg-gray-500';
  };

  if (gameOver && gameEndTime) {
    const stats = calculateStats();
    const totalTime = gameEndTime - gameStartTime;
    const accuracy = correctAnswers > 0 ? Math.round((correctAnswers / (correctAnswers + wrongAnswers)) * 100) : 0;
    
    return (
      <div className="w-full min-h-[calc(100vh-10rem)] flex items-center justify-center bg-luxury-black p-6">
        <div className="w-full max-w-md bg-luxury-black rounded-2xl shadow-2xl border-2 border-luxury-gold p-6 flex flex-col items-center animate-fade-in">
          {/* Best Results & Tips Section */}
          <div className="w-full mb-4 p-3 rounded-lg bg-luxury-gold/10 border border-luxury-gold/40 text-center">
            <div className="text-base font-semibold text-luxury-gold mb-1">How to Get the Best Results</div>
            <div className="text-sm text-luxury-white/80 mb-1">
              Find and remove excess colored cells quickly. Look for colors that appear more than they should in the grid!
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}s average time
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Excess Cells Results</div>
          </div>
          
          <div className="w-full bg-luxury-black/50 rounded-lg border border-luxury-gold/30 p-4 mb-4">
            <div className="flex justify-between text-lg">
              <span className="text-luxury-white/80">Score:</span>
              <span className="font-bold text-luxury-gold">{score}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Accuracy:</span>
              <span className="font-semibold text-luxury-gold">{accuracy}%</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Correct:</span>
              <span className="text-green-400">{correctAnswers}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Wrong:</span>
              <span className="text-red-400">{wrongAnswers}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Rounds:</span>
              <span>{rounds}/{totalRounds}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Avg. Time:</span>
              <span>{stats?.average ?? 0}s</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Best:</span>
              <span>{stats?.best ?? 0}s</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Worst:</span>
              <span>{stats?.worst ?? 0}s</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Total Time:</span>
              <span>{(totalTime / 1000).toFixed(2)}s</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Performance:</span>
              <span className={`font-semibold ${stats?.ratingColor ?? 'text-luxury-gold'}`}>{stats?.performanceRating}</span>
            </div>
          </div>
          
          <button
            className="text-xs text-luxury-gold underline mb-2 focus:outline-none"
            onClick={() => setShowDetails((v) => !v)}
          >
            {showDetails ? "Hide Details" : "Show Detailed Stats"}
          </button>
          {showDetails && (
            <div className="w-full bg-luxury-black/80 rounded-lg border border-luxury-gold/30 p-3 mb-2">
              <div className="text-sm text-luxury-gold mb-1 font-semibold">Response Times (s):</div>
              <div className="flex flex-wrap gap-2 text-xs text-luxury-white/80">
                {reactionTimes.map((t, i) => (
                  <span key={i} className="px-2 py-1 bg-luxury-gold/10 rounded">{t.toFixed(2)}s</span>
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
              onClick={() => navigator.share && navigator.share({ title: 'Excess Cells Results', text: `Score: ${score}, Accuracy: ${accuracy}%, Avg: ${stats?.average ?? 0}s`, url: window.location.href })}
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
      <div className="text-center space-y-2">
        <div className="text-lg">Score: {score}</div>
        <div className="text-sm text-luxury-white/70">
          Time: {timeLeft}s | Round {rounds + 1}/{totalRounds}
        </div>
        <div className="text-xs text-luxury-white/50">
          Remove excess cells ({excessCells.size} remaining)
        </div>
      </div>
      
      <div 
        className="grid gap-1 w-full max-w-sm"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      >
        {grid.map((color, index) => (
          <button
            key={index}
            className={`relative h-12 w-full rounded border-2 transition-all ${getCellColor(color)} ${
              excessCells.has(index) 
                ? 'border-luxury-gold ring-2 ring-luxury-gold/50' 
                : 'border-transparent'
            } hover:scale-105 active:scale-95`}
            onClick={() => handleCellClick(index)}
          >
            {excessCells.has(index) && (
              <X className="absolute inset-0 h-4 w-4 m-auto text-white drop-shadow-lg" />
            )}
          </button>
        ))}
      </div>
      
      <div className="text-center text-xs text-luxury-white/50 max-w-sm">
        Find and remove the excess colored cells. Look for cells that appear more than they should.
      </div>
    </div>
  );
};

export default ExcessCellsGame;
