
import React, { useState, useEffect, useCallback } from 'react';

interface NumbersOrderGameProps {
  onFinish: (score: number, time: number) => void;
}

const NumbersOrderGame: React.FC<NumbersOrderGameProps> = ({ onFinish }) => {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [startTime, setStartTime] = useState(0);

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
    if (num === currentNumber) {
      if (num === 9) {
        const timeTaken = Date.now() - startTime;
        const score = Math.max(0, Math.floor(10000 - timeTaken));
        onFinish(score, timeTaken);
      } else {
        setCurrentNumber(currentNumber + 1);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-4">
      <div className="text-center space-y-2">
        <div className="text-lg text-luxury-white/70">Tap in ascending order</div>
        <div className="text-4xl font-bold text-luxury-gold">{currentNumber}</div>
      </div>
      <div className="grid grid-cols-3 gap-4 w-72">
        {numbers.map((num) => (
          <button
            key={num}
            onClick={() => handleClick(num)}
            className={`h-20 w-20 flex items-center justify-center text-2xl font-bold rounded-lg transition-all
              ${
                currentNumber > num
                  ? "bg-luxury-gold/20 text-luxury-gold/50 border-luxury-gold/30 cursor-not-allowed"
                  : "bg-luxury-black border border-luxury-white/20 hover:border-luxury-gold/50 hover:bg-luxury-gold/10"
              }`}
            disabled={currentNumber > num}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NumbersOrderGame;
