
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

  const totalRounds = 8;
  const gridSize = 6; // 6x6 grid
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

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
    const excessCount = 3 + Math.floor(Math.random() * 3); // 3-5 excess
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
  }, []);

  useEffect(() => {
    setGameStartTime(Date.now());
    generateGrid();
  }, [generateGrid]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onFinish(score, Date.now() - gameStartTime);
    }
  }, [timeLeft, score, gameStartTime, onFinish]);

  const handleCellClick = (index: number) => {
    if (excessCells.has(index)) {
      // Correct - remove excess cell
      setScore(prevScore => prevScore + 100);
      setExcessCells(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        
        // Check if all excess cells removed
        if (newSet.size === 0) {
          setRounds(prevRounds => {
            const newRounds = prevRounds + 1;
            if (newRounds >= totalRounds) {
              onFinish(score + 100, Date.now() - gameStartTime);
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
