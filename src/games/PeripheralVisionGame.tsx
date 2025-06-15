
import React, { useState, useEffect, useCallback } from "react";

interface NumberPosition {
  value: number;
  x: number;
  y: number;
  id: number;
}

interface PeripheralVisionGameProps {
  onFinish: (score: number, time: number) => void;
}

const PeripheralVisionGame: React.FC<PeripheralVisionGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [numbers, setNumbers] = useState<NumberPosition[]>([]);
  const [largestNumber, setLargestNumber] = useState<number>(0);
  const [centerDistraction, setCenterDistraction] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [showNumbers, setShowNumbers] = useState<boolean>(true);

  const distractions = ["✨", "🎯", "⭐", "💎", "🔥", "⚡", "🌟", "💫"];

  const generateRound = useCallback(() => {
    const numNumbers = 4 + Math.floor(Math.random() * 4); // 4-7 numbers
    const newNumbers: NumberPosition[] = [];
    let maxValue = 0;

    // Generate numbers around the edges
    for (let i = 0; i < numNumbers; i++) {
      const value = 10 + Math.floor(Math.random() * 90); // 10-99
      let x, y;

      // Position numbers at edges
      const edge = Math.floor(Math.random() * 4);
      switch (edge) {
        case 0: // top
          x = 20 + Math.random() * 280;
          y = 20;
          break;
        case 1: // right
          x = 300;
          y = 20 + Math.random() * 280;
          break;
        case 2: // bottom
          x = 20 + Math.random() * 280;
          y = 300;
          break;
        default: // left
          x = 20;
          y = 20 + Math.random() * 280;
      }

      const numberPos: NumberPosition = { value, x, y, id: i };
      newNumbers.push(numberPos);

      if (value > maxValue) {
        maxValue = value;
      }
    }

    setNumbers(newNumbers);
    setLargestNumber(maxValue);
    setCenterDistraction(distractions[Math.floor(Math.random() * distractions.length)]);
    setShowNumbers(true);

    // Hide numbers after 2 seconds
    setTimeout(() => {
      setShowNumbers(false);
    }, 2000);
  }, []);

  useEffect(() => {
    setGameStartTime(Date.now());
    generateRound();
  }, [generateRound]);

  const handleNumberClick = (value: number) => {
    if (!showNumbers) return;

    if (value === largestNumber) {
      setScore(prevScore => prevScore + 100);
      setFeedback("Correct! +100");
    } else {
      setFeedback(`Wrong! Largest was ${largestNumber}`);
    }

    setTimeout(() => {
      setFeedback("");
      if (round < 10) {
        setRound(prev => prev + 1);
        generateRound();
      } else {
        onFinish(score + (value === largestNumber ? 100 : 0), Date.now() - gameStartTime);
      }
    }, 1500);
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
      
      <div className="relative w-80 h-80 bg-luxury-black border-2 border-luxury-white/20 rounded-lg overflow-hidden">
        {/* Center distraction */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="text-6xl animate-pulse">{centerDistraction}</div>
        </div>

        {/* Numbers at edges */}
        {showNumbers && numbers.map((num) => (
          <button
            key={num.id}
            className="absolute text-white font-bold text-lg hover:text-luxury-gold transition-colors cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${num.x}px`, top: `${num.y}px` }}
            onClick={() => handleNumberClick(num.value)}
          >
            {num.value}
          </button>
        ))}

        {!showNumbers && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              className="btn-primary"
              onClick={() => handleNumberClick(0)}
            >
              What was the largest number?
            </button>
          </div>
        )}
      </div>
      
      <div className="text-center text-xs text-luxury-white/50">
        {showNumbers ? "Focus on center, remember the largest number at edges" : "Click when you remember the largest number"}
      </div>
    </div>
  );
};

export default PeripheralVisionGame;
