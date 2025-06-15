
import React, { useState, useEffect, useCallback } from "react";

interface Line {
  id: number;
  length: number;
  x: number;
  y: number;
  angle: number;
}

interface LongestLineGameProps {
  onFinish: (score: number, time: number) => void;
}

const LongestLineGame: React.FC<LongestLineGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [lines, setLines] = useState<Line[]>([]);
  const [longestLineId, setLongestLineId] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");

  const generateLines = useCallback(() => {
    const numLines = 3 + Math.floor(Math.random() * 4); // 3-6 lines
    const newLines: Line[] = [];
    let maxLength = 0;
    let longestId = 0;

    for (let i = 0; i < numLines; i++) {
      const length = 60 + Math.random() * 140; // 60-200px
      const line: Line = {
        id: i,
        length,
        x: 40 + Math.random() * 240, // Keep within bounds
        y: 40 + Math.random() * 240,
        angle: Math.random() * 360,
      };
      
      if (length > maxLength) {
        maxLength = length;
        longestId = i;
      }
      
      newLines.push(line);
    }

    setLines(newLines);
    setLongestLineId(longestId);
  }, []);

  useEffect(() => {
    setGameStartTime(Date.now());
    generateLines();
  }, [generateLines]);

  const handleLineClick = (lineId: number) => {
    if (lineId === longestLineId) {
      setScore(prevScore => prevScore + 100);
      setFeedback("Correct! +100");
    } else {
      setFeedback("Wrong line!");
    }

    setTimeout(() => {
      setFeedback("");
      if (round < 10) {
        setRound(prev => prev + 1);
        generateLines();
      } else {
        onFinish(score + (lineId === longestLineId ? 100 : 0), Date.now() - gameStartTime);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-4">
      <div className="text-center space-y-2">
        <div className="text-lg">Score: {score}</div>
        <div className="text-sm text-luxury-white/70">Round: {round}/10</div>
        {feedback && (
          <div className={`text-sm font-medium ${feedback.includes("Correct") ? "text-green-400" : "text-red-400"}`}>
            {feedback}
          </div>
        )}
      </div>
      
      <div className="relative w-80 h-80 bg-luxury-black border-2 border-luxury-white/20 rounded-lg">
        <svg className="w-full h-full">
          {lines.map((line) => (
            <line
              key={line.id}
              x1={line.x}
              y1={line.y}
              x2={line.x + line.length * Math.cos(line.angle * Math.PI / 180)}
              y2={line.y + line.length * Math.sin(line.angle * Math.PI / 180)}
              stroke="white"
              strokeWidth="3"
              className="cursor-pointer hover:stroke-luxury-gold transition-colors"
              onClick={() => handleLineClick(line.id)}
            />
          ))}
        </svg>
      </div>
      
      <div className="text-center text-xs text-luxury-white/50">
        Tap the longest visible line
      </div>
    </div>
  );
};

export default LongestLineGame;
