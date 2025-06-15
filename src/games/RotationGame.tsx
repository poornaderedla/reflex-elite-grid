
import React, { useState, useEffect, useCallback } from 'react';
import { Check, X } from 'lucide-react';

interface RotationGameProps {
  onFinish: (score: number, time: number) => void;
}

const generatePattern = (size: number): boolean[] => {
  const pattern = new Array(size * size).fill(false);
  const numPoints = Math.floor(Math.random() * 3) + 3; // 3 to 5 points
  let count = 0;
  while (count < numPoints) {
    const index = Math.floor(Math.random() * pattern.length);
    if (!pattern[index]) {
      pattern[index] = true;
      count++;
    }
  }
  return pattern;
};

const rotatePattern = (pattern: boolean[], size: number): boolean[] => {
  const rotated = new Array(size * size).fill(false);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (pattern[r * size + c]) {
        rotated[c * size + (size - 1 - r)] = true;
      }
    }
  }
  return rotated;
};

const PatternGrid: React.FC<{ pattern: boolean[], size: number }> = ({ pattern, size }) => (
  <div className={`grid grid-cols-4 gap-1`}>
    {pattern.map((isFilled, i) => (
      <div key={i} className={`w-6 h-6 rounded-sm ${isFilled ? 'bg-luxury-gold' : 'bg-luxury-white/10'}`} />
    ))}
  </div>
);

const RotationGame: React.FC<RotationGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [mainPattern, setMainPattern] = useState<boolean[]>([]);
  const [options, setOptions] = useState<boolean[][]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [startTime, setStartTime] = useState(0);
  const size = 4;
  const maxRounds = 5;

  const createNewRound = useCallback(() => {
    setFeedback(null);
    const pattern = generatePattern(size);
    setMainPattern(pattern);
    const rotated = rotatePattern(pattern, size);

    const newOptions: boolean[][] = [rotated];
    while (newOptions.length < 4) {
      newOptions.push(generatePattern(size));
    }
    // Shuffle
    for (let i = newOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newOptions[i], newOptions[j]] = [newOptions[j], newOptions[i]];
    }
    setOptions(newOptions);
  }, []);
  
  useEffect(() => {
    setStartTime(Date.now());
    createNewRound();
  }, []);

  useEffect(() => {
    if (round > 1) {
      createNewRound();
    }
  }, [round, createNewRound]);


  const handleOptionClick = (selectedPattern: boolean[]) => {
    const rotated = rotatePattern(mainPattern, size);
    const isCorrect = JSON.stringify(selectedPattern) === JSON.stringify(rotated);
    let currentScore = score;

    if (isCorrect) {
      currentScore += 200;
      setScore(currentScore);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }
    
    setTimeout(() => {
        if(round >= maxRounds) {
            onFinish(currentScore, Date.now() - startTime);
        } else {
            setRound(r => r + 1);
        }
    }, 1000);
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-6">
       <div className="text-center space-y-2">
        <div className="text-lg">Score: {score}</div>
        <div className="text-sm text-luxury-white/70">Round: {round}/{maxRounds}</div>
      </div>

      <div className="text-center space-y-3">
        <p className="text-luxury-white/70">Original Pattern</p>
        {mainPattern.length > 0 && <PatternGrid pattern={mainPattern} size={size} />}
      </div>
      
      <div className="text-center space-y-3">
        <p className="text-luxury-white/70">Which is the 90° rotated version?</p>
        <div className="grid grid-cols-2 gap-4">
            {options.map((option, i) => (
                <button 
                    key={i} 
                    onClick={() => handleOptionClick(option)}
                    className="p-3 border border-luxury-white/20 rounded-lg hover:border-luxury-gold/50"
                    disabled={feedback !== null}
                >
                    <PatternGrid pattern={option} size={size} />
                </button>
            ))}
        </div>
      </div>
      {feedback && (
        <div className={`mt-4 text-2xl font-bold flex items-center gap-2 ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
            {feedback === 'correct' ? <Check size={28}/> : <X size={28}/>}
            {feedback.charAt(0).toUpperCase() + feedback.slice(1)}
        </div>
      )}
    </div>
  );
};

export default RotationGame;
