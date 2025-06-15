
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface ColorChange2GameProps {
  onFinish: (score: number, time: number) => void;
}

const colors = ['#EF4444', '#3B82F6', '#22C55E', '#EAB308', '#8B5CF6'];
const colorNames: { [key: string]: string } = {
  '#EF4444': 'Red',
  '#3B82F6': 'Blue',
  '#22C55E': 'Green',
  '#EAB308': 'Yellow',
  '#8B5CF6': 'Purple'
}

const ColorChange2Game: React.FC<ColorChange2GameProps> = ({ onFinish }) => {
  const [targetColor, setTargetColor] = useState('');
  const [currentColor, setCurrentColor] = useState('#111827'); // initial bg color
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [round, setRound] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const startTimeRef = useRef(0);
  const reactionTimeRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRounds = 10;

  const startRound = useCallback(() => {
    if (round >= maxRounds) {
      onFinish(score, Date.now() - startTimeRef.current);
      return;
    }
    setCurrentColor('#111827');
    setMessage(`Round ${round + 1}`);

    const delay = Math.random() * 2000 + 1000;
    timeoutRef.current = setTimeout(() => {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setCurrentColor(randomColor);
      reactionTimeRef.current = Date.now();
      setMessage('');
    }, delay);
  }, [round, score, maxRounds, onFinish]);

  useEffect(() => {
    const initialTarget = colors[Math.floor(Math.random() * colors.length)];
    setTargetColor(initialTarget);
    setMessage(`Tap only on ${colorNames[initialTarget]}`);
    setTimeout(() => {
        setMessage('');
        setGameStarted(true);
        startTimeRef.current = Date.now();
    }, 3000)
  }, []);

  useEffect(() => {
    if(gameStarted) {
        startRound();
    }
    return () => {
        if(timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [gameStarted, round, startRound])


  const handleClick = () => {
    if (!gameStarted || message) return;
    if(timeoutRef.current) clearTimeout(timeoutRef.current);

    if (currentColor === '#111827') { // Clicked too early
      setMisses(m => m + 1);
      setMessage('Too soon!');
    } else {
      if (currentColor === targetColor) {
        const reactionTime = Date.now() - reactionTimeRef.current;
        const roundScore = Math.max(0, Math.floor(1000 - reactionTime));
        setScore(s => s + roundScore);
        setMessage(`Correct! +${roundScore}`);
      } else {
        setMisses(m => m + 1);
        setMessage('Wrong color!');
      }
    }
    setTimeout(() => {
        setRound(r => r + 1);
    }, 1000)
  };

  return (
    <div
      onClick={handleClick}
      className="w-full h-full flex flex-col items-center justify-center transition-colors duration-200"
      style={{ backgroundColor: currentColor, minHeight: 'calc(100vh - 10rem)' }}
    >
      <div className="text-center text-white bg-black/30 p-4 rounded-lg">
        {message ? (
          <p className="text-2xl font-bold">{message}</p>
        ) : (
          <>
            <p className="text-lg">Score: {score}</p>
            <p className="text-sm text-red-400">Misses: {misses}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ColorChange2Game;
