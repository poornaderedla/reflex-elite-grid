
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
  const [gameOver, setGameOver] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [stepStartTime, setStepStartTime] = useState<number>(0);

  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  const directionIcons = {
    up: <ArrowUp size={64} />,
    down: <ArrowDown size={64} />,
    left: <ArrowLeft size={64} />,
    right: <ArrowRight size={64} />,
  };

  const reactionTimeBenchmarks = {
    worldClass: 500,
    excellent: 600,
    good: 700,
    average: 800,
    slow: 900,
    verySlow: 1100
  };

  const calculateStats = () => {
    if (reactionTimes.length === 0) return null;
    
    const average = Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);
    const best = Math.min(...reactionTimes);
    const worst = Math.max(...reactionTimes);
    const accuracy = correctAnswers > 0 ? Math.round((correctAnswers / (correctAnswers + wrongAnswers)) * 100) : 0;
    
    let performanceRating = 'Very Slow';
    let ratingColor = 'text-red-400';
    
    if (average <= reactionTimeBenchmarks.worldClass) {
      performanceRating = 'World Class';
      ratingColor = 'text-purple-400';
    } else if (average <= reactionTimeBenchmarks.excellent) {
      performanceRating = 'Excellent';
      ratingColor = 'text-blue-400';
    } else if (average <= reactionTimeBenchmarks.good) {
      performanceRating = 'Good';
      ratingColor = 'text-green-400';
    } else if (average <= reactionTimeBenchmarks.average) {
      performanceRating = 'Average';
      ratingColor = 'text-yellow-400';
    } else if (average <= reactionTimeBenchmarks.slow) {
      performanceRating = 'Slow';
      ratingColor = 'text-orange-400';
    }
    
    return {
      average,
      best,
      worst,
      accuracy,
      performanceRating,
      ratingColor,
      benchmarks: reactionTimeBenchmarks
    };
  };
  
  const generateSequence = useCallback(() => {
    const newSequence = Array.from({ length: 10 }, () => directions[Math.floor(Math.random() * 4)]);
    setSequence(newSequence);
    setCurrentStep(0);
    setStepStartTime(Date.now());
  }, []);

  useEffect(() => {
    generateSequence();
    setStartTime(Date.now());
  }, [generateSequence]);

  const handleSwipe = (direction: Direction) => {
    if (sequence.length === 0) return;
    
    const reactionTime = Date.now() - stepStartTime;
    
    if (direction === sequence[currentStep]) {
      const newScore = score + 100;
      setScore(newScore);
      setReactionTimes(prev => [...prev, reactionTime]);
      setCorrectAnswers(c => c + 1);
      const nextStep = currentStep + 1;
      if (nextStep >= sequence.length) {
        setGameOver(true);
        setGameEndTime(Date.now());
      } else {
        setCurrentStep(nextStep);
        setStepStartTime(Date.now());
      }
    } else {
      // Game over on wrong swipe
      setWrongAnswers(w => w + 1);
      setGameOver(true);
      setGameEndTime(Date.now());
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

  if (gameOver && gameEndTime) {
    const stats = calculateStats();
    const totalTime = gameEndTime - startTime;
    const accuracy = correctAnswers > 0 ? Math.round((correctAnswers / (correctAnswers + wrongAnswers)) * 100) : 0;
    
    return (
      <div className="w-full min-h-[calc(100vh-10rem)] flex items-center justify-center bg-luxury-black p-6">
        <div className="w-full max-w-md bg-luxury-black rounded-2xl shadow-2xl border-2 border-luxury-gold p-6 flex flex-col items-center animate-fade-in">
          {/* Best Results & Tips Section */}
          <div className="w-full mb-4 p-3 rounded-lg bg-luxury-gold/10 border border-luxury-gold/40 text-center">
            <div className="text-base font-semibold text-luxury-gold mb-1">How to Get the Best Results</div>
            <div className="text-sm text-luxury-white/80 mb-1">
              Swipe in the direction of the arrow quickly and accurately. Follow the sequence without mistakes!
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}ms average reaction
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Swipe 2 Results</div>
          </div>
          
          <div className="w-full bg-luxury-black/50 rounded-lg border border-luxury-gold/30 p-4 mb-4">
            <div className="flex justify-between text-lg">
              <span className="text-luxury-white/80">Score:</span>
              <span className="font-bold text-luxury-gold">{score}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Accuracy:</span>
              <span className="font-semibold text-luxury-gold">{accuracy}%</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Correct:</span>
              <span className="text-green-400">{correctAnswers}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Wrong:</span>
              <span className="text-red-400">{wrongAnswers}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Steps:</span>
              <span>{currentStep + 1}/{sequence.length}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Avg. Reaction:</span>
              <span>{stats?.average ?? 0}ms</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Best:</span>
              <span>{stats?.best ?? 0}ms</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Worst:</span>
              <span>{stats?.worst ?? 0}ms</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Total Time:</span>
              <span>{(totalTime / 1000).toFixed(2)}s</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Performance:</span>
              <span className={`font-semibold ${stats?.ratingColor ?? 'text-luxury-gold'}`}>{stats?.performanceRating}</span>
            </div>
          </div>
          
          <button
            className="text-xs text-luxury-gold underline mb-2 focus:outline-none"
            onClick={() => setShowDetails((v) => !v)}
          >
            {showDetails ? "Hide Details" : "Show Detailed Stats"}
          </button>
          {showDetails && (
            <div className="w-full bg-luxury-black/80 rounded-lg border border-luxury-gold/30 p-3 mb-2">
              <div className="text-sm text-luxury-gold mb-1 font-semibold">Reaction Times (ms):</div>
              <div className="flex flex-wrap gap-2 text-xs text-luxury-white/80">
                {reactionTimes.map((t, i) => (
                  <span key={i} className="px-2 py-1 bg-luxury-gold/10 rounded">{t}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-4 mt-4 w-full">
            <button
              className="flex-1 px-4 py-2 bg-luxury-gold text-luxury-black font-semibold rounded hover:bg-yellow-400 transition"
              onClick={() => window.location.reload()}
            >
              Play Again
            </button>
            <button
              className="flex-1 px-4 py-2 bg-luxury-white text-luxury-black font-semibold rounded hover:bg-luxury-gold transition"
              onClick={() => navigator.share && navigator.share({ title: 'Swipe 2 Results', text: `Score: ${score}, Accuracy: ${accuracy}%, Avg: ${stats?.average ?? 0}ms`, url: window.location.href })}
            >
              Share
            </button>
          </div>
        </div>
      </div>
    );
  }

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
