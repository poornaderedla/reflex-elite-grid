
import React, { useState, useEffect, useCallback } from 'react';

interface SelectionGameProps {
  onFinish: (score: number, time: number) => void;
}

const SelectionGame: React.FC<SelectionGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [targetNumber, setTargetNumber] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [feedback, setFeedback] = useState('');
  const [startTime, setStartTime] = useState(Date.now());
  const maxRounds = 10;

  const generateRound = useCallback(() => {
    const target = Math.floor(Math.random() * 100);
    const newOptions: number[] = [target];
    while (newOptions.length < 4) {
      const option = Math.floor(Math.random() * 100);
      if (!newOptions.includes(option)) {
        newOptions.push(option);
      }
    }
    // Shuffle options
    for (let i = newOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newOptions[i], newOptions[j]] = [newOptions[j], newOptions[i]];
    }
    setTargetNumber(target);
    setOptions(newOptions);
  }, []);

  useEffect(() => {
    generateRound();
  }, [round, generateRound]);
  
  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const handleSelect = (selectedNumber: number) => {
    let newScore = score;
    if (selectedNumber === targetNumber) {
      newScore += 100;
      setScore(newScore);
      setFeedback('Correct!');
    } else {
      setFeedback('Wrong!');
    }

    setTimeout(() => {
      setFeedback('');
      if (round < maxRounds) {
        setRound(r => r + 1);
      } else {
        onFinish(newScore, Date.now() - startTime);
      }
    }, 500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-8">
      <div className="text-center space-y-2">
        <div className="text-lg">Score: {score}</div>
        <div className="text-sm text-luxury-white/70">Round: {round}/{maxRounds}</div>
         {feedback && (
          <div className={`text-xl font-medium ${feedback === "Correct!" ? "text-green-400" : "text-red-400"}`}>
            {feedback}
          </div>
        )}
      </div>
      <div className="text-center space-y-4">
        <div className="text-lg text-luxury-white/70">Select the number:</div>
        <div className="text-6xl font-bold text-luxury-gold">{targetNumber}</div>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(option)}
            className="btn-outline h-24 text-2xl"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SelectionGame;
