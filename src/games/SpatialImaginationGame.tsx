
import React, { useState, useEffect, useCallback } from "react";

interface Table {
  id: number;
  pattern: boolean[][];
  rotated: boolean[][];
}

interface SpatialImaginationGameProps {
  onFinish: (score: number, time: number) => void;
}

const SpatialImaginationGame: React.FC<SpatialImaginationGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [tables, setTables] = useState<Table[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");

  const generatePattern = (size: number = 3): boolean[][] => {
    const pattern: boolean[][] = [];
    for (let i = 0; i < size; i++) {
      pattern[i] = [];
      for (let j = 0; j < size; j++) {
        pattern[i][j] = Math.random() > 0.6;
      }
    }
    return pattern;
  };

  const rotatePattern = (pattern: boolean[][]): boolean[][] => {
    const size = pattern.length;
    const rotated: boolean[][] = [];
    for (let i = 0; i < size; i++) {
      rotated[i] = [];
      for (let j = 0; j < size; j++) {
        rotated[i][j] = pattern[size - 1 - j][i];
      }
    }
    return rotated;
  };

  const generateTables = useCallback(() => {
    const originalPattern = generatePattern();
    const correctRotated = rotatePattern(originalPattern);
    
    const newTables: Table[] = [
      { id: 0, pattern: originalPattern, rotated: correctRotated },
      { id: 1, pattern: originalPattern, rotated: generatePattern() },
      { id: 2, pattern: originalPattern, rotated: generatePattern() },
    ];
    
    // Shuffle and set correct answer
    const shuffled = [...newTables].sort(() => Math.random() - 0.5);
    const correctIndex = shuffled.findIndex(table => table.id === 0);
    
    setTables(shuffled);
    setCorrectAnswer(correctIndex);
  }, []);

  useEffect(() => {
    setGameStartTime(Date.now());
    generateTables();
  }, [generateTables]);

  const handleTableClick = (tableIndex: number) => {
    if (tableIndex === correctAnswer) {
      setScore(prevScore => prevScore + 100);
      setFeedback("Correct! +100");
    } else {
      setFeedback("Wrong table!");
    }

    setTimeout(() => {
      setFeedback("");
      if (round < 8) {
        setRound(prev => prev + 1);
        generateTables();
      } else {
        onFinish(score + (tableIndex === correctAnswer ? 100 : 0), Date.now() - gameStartTime);
      }
    }, 1000);
  };

  const renderPattern = (pattern: boolean[][], isOriginal: boolean = false) => (
    <div className={`grid grid-cols-3 gap-1 p-3 rounded-lg ${isOriginal ? 'bg-luxury-gold/10' : 'bg-luxury-black'}`}>
      {pattern.map((row, i) =>
        row.map((cell, j) => (
          <div
            key={`${i}-${j}`}
            className={`w-6 h-6 rounded border ${
              cell ? 'bg-luxury-white' : 'bg-luxury-black border-luxury-white/20'
            }`}
          />
        ))
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-4">
      <div className="text-center space-y-2">
        <div className="text-lg">Score: {score}</div>
        <div className="text-sm text-luxury-white/70">Round: {round}/8</div>
        {feedback && (
          <div className={`text-sm font-medium ${feedback.includes("Correct") ? "text-green-400" : "text-red-400"}`}>
            {feedback}
          </div>
        )}
      </div>

      {tables.length > 0 && (
        <>
          <div className="text-center">
            <div className="text-sm text-luxury-white/70 mb-2">Original Pattern:</div>
            {renderPattern(tables[0].pattern, true)}
          </div>

          <div className="text-center text-sm text-luxury-white/70 mb-2">
            Which is the same pattern rotated 90°?
          </div>

          <div className="grid grid-cols-3 gap-4">
            {tables.map((table, index) => (
              <button
                key={index}
                onClick={() => handleTableClick(index)}
                className="p-2 rounded-lg border border-luxury-white/20 hover:border-luxury-gold/50 transition-colors"
              >
                {renderPattern(table.rotated)}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="text-center text-xs text-luxury-white/50">
        Find the pattern that matches the original when rotated 90° clockwise
      </div>
    </div>
  );
};

export default SpatialImaginationGame;
