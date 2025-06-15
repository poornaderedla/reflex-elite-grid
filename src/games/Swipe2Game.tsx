
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

type Direction = 'up' | 'down' | 'left' | 'right';

interface Swipe2GameProps {
  onFinish: (score: number, time: number) => void;
}

const Swipe2Game: React.FC<Swipe2GameProps> = ({ onFinish }) => {
  const [sequence, setSequence] = useState<Direction[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);

  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  const directionIcons = {
    up: <ArrowUp size={64} />,
    down: <ArrowDown size={64} />,
    left: <ArrowLeft size={64} />,
    right: <ArrowRight size={64} />,
  };
  
  const generateSequence = useCallback(() => {
    const newSequence = Array.from({ length: 10 }, () => directions[Math.floor(Math.random() * 4)]);
    setSequence(newSequence);
    setCurrentStep(0);
  }, []);

  useEffect(() => {
    generateSequence();
    setStartTime(Date.now());
  }, [generateSequence]);

  const handleSwipe = (direction: Direction) => {
    if (sequence.length === 0) return;
    if (direction === sequence[currentStep]) {
      const newScore = score + 100;
      setScore(newScore);
      const nextStep = currentStep + 1;
      if (nextStep >= sequence.length) {
        onFinish(newScore, Date.now() - startTime);
      } else {
        setCurrentStep(nextStep);
      }
    } else {
      // Game over on wrong swipe
      onFinish(score, Date.now() - startTime);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };
  
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStart) return;
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    
    if (Math.abs(dx) > Math.abs(dy)) { // Horizontal swipe
      if (Math.abs(dx) > 30) handleSwipe(dx > 0 ? 'right' : 'left');
    } else { // Vertical swipe
      if (Math.abs(dy) > 30) handleSwipe(dy > 0 ? 'down' : 'up');
    }
    setTouchStart(null);
  };

  if (sequence.length === 0) return null;

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-8 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="text-center space-y-2">
        <div className="text-lg">Score: {score}</div>
        <div className="text-sm text-luxury-white/70">Step: {currentStep + 1}/{sequence.length}</div>
      </div>
      <div className="text-luxury-gold animate-pulse">
        {directionIcons[sequence[currentStep]]}
      </div>
      <p className="text-luxury-white/70">Swipe in the direction of the arrow.</p>
    </div>
  );
};

export default Swipe2Game;
