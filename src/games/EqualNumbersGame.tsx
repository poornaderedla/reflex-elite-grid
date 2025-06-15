
import React, { useState, useEffect, useCallback } from "react";

interface EqualNumbersGameProps {
  onFinish: (score: number, time: number) => void;
}

const EqualNumbersGame: React.FC<EqualNumbersGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [roundStartTime, setRoundStartTime] = useState<number>(0);

  const generateRound = useCallback(() => {
    const target = Math.floor(Math.random() * 9) + 1;
    const gridNumbers: number[] = [];
    
    // Add target number 2-4 times
    const targetCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < targetCount; i++) {
      gridNumbers.push(target);
    }
    
    // Fill remaining slots with different numbers
    while (gridNumbers.length < 16) {
      const randomNum = Math.floor(Math.random() * 9) + 1;
      if (randomNum !== target) {
        gridNumbers.push(randomNum);
      }
    }
    
    // Shuffle array
    for (let i = gridNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gridNumbers[i], gridNumbers[j]] = [gridNumbers[j], gridNumbers[i]];
    }
    
    setNumbers(gridNumbers);
    setTargetNumber(target);
    setRoundStartTime(Date.now());
  }, []);

  useEffect(() => {
    setGameStartTime(Date.now());
    generateRound();
  }, [generateRound]);

  const handleNumberClick = (clickedNumber: number) => {
    const timeTaken = (Date.now() - roundStartTime) / 1000;
    
    if (clickedNumber === targetNumber) {
      const roundScore = Math.floor(100 + Math.max(0, (3 - timeTaken) * 20));
      setScore(prevScore => prevScore + roundScore);
      setFeedback(`Correct! +${roundScore}`);
    } else {
      setFeedback("Wrong number!");
    }

    setTimeout(() => {
      setFeedback("");
      if (round < 10) {
        setRound(prev => prev + 1);
        generateRound();
      } else {
        onFinish(score + (clickedNumber === targetNumber ? Math.floor(100 + Math.max(0, (3 - timeTaken) * 20)) : 0), Date.now() - gameStartTime);
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

      <div className="text-center space-y-2">
        <div className="text-sm text-luxury-white/70">Find all numbers equal to:</div>
        <div className="text-4xl font-bold text-luxury-gold">{targetNumber}</div>
      </div>

      <div className="grid grid-cols-4 gap-2 w-80">
        {numbers.map((number, index) => (
          <button
            key={index}
            onClick={() => handleNumberClick(number)}
            className="w-18 h-18 bg-luxury-black border border-luxury-white/20 rounded-lg text-xl font-bold text-luxury-white hover:border-luxury-gold/50 hover:bg-luxury-gold/10 transition-all"
          >
            {number}
          </button>
        ))}
      </div>

      <div className="text-center text-xs text-luxury-white/50">
        Tap all numbers that match the target number
      </div>
    </div>
  );
};

export default EqualNumbersGame;
