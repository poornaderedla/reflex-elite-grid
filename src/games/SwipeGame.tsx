
import React, { useState, useEffect, useCallback } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

interface SwipeGameProps {
  onFinish: (score: number, time: number) => void;
}

type Direction = 'up' | 'down' | 'left' | 'right';

const SwipeGame: React.FC<SwipeGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [currentDirection, setCurrentDirection] = useState<Direction | null>(null);
  const [rounds, setRounds] = useState<number>(0);
  const [showDirection, setShowDirection] = useState<boolean>(false);
  const [directionTime, setDirectionTime] = useState<number>(0);
  const [gameOver, setGameOver] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);

  const totalRounds = 12;
  const directions: Direction[] = ['up', 'down', 'left', 'right'];

  const reactionTimeBenchmarks = {
    worldClass: 400,
    excellent: 500,
    good: 600,
    average: 700,
    slow: 800,
    verySlow: 1000
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

  const getDirectionIcon = (direction: Direction) => {
    switch (direction) {
      case 'up': return <ArrowUp className="h-16 w-16" />;
      case 'down': return <ArrowDown className="h-16 w-16" />;
      case 'left': return <ArrowLeft className="h-16 w-16" />;
      case 'right': return <ArrowRight className="h-16 w-16" />;
    }
  };

  const showNewDirection = useCallback(() => {
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    setCurrentDirection(randomDirection);
    setShowDirection(true);
    setDirectionTime(Date.now());
    
    // Auto-advance if no swipe within 2 seconds
    setTimeout(() => {
      if (showDirection) {
        nextRound();
      }
    }, 2000);
  }, [showDirection]);

  const nextRound = useCallback(() => {
    setShowDirection(false);
    setCurrentDirection(null);
    setRounds(prevRounds => {
      const newRounds = prevRounds + 1;
      if (newRounds >= totalRounds) {
        setGameOver(true);
        setGameEndTime(Date.now());
        return prevRounds;
      } else {
        // Start next direction after delay
        setTimeout(() => {
          const delay = Math.random() * 1500 + 1000; // 1-2.5 seconds
          setTimeout(showNewDirection, delay);
        }, 500);
        return newRounds;
      }
    });
  }, [showNewDirection]);

  useEffect(() => {
    setGameStartTime(Date.now());
    // Start first direction
    const delay = Math.random() * 1500 + 1000;
    setTimeout(showNewDirection, delay);
  }, [showNewDirection]);

  const handleSwipe = (direction: Direction) => {
    if (!showDirection || !currentDirection) return;
    
    if (direction === currentDirection) {
      // Correct swipe
      const reactionTime = Date.now() - directionTime;
      const points = Math.max(0, Math.floor(800 - reactionTime / 3));
      setScore(prevScore => prevScore + points);
      setReactionTimes(prev => [...prev, reactionTime]);
      setCorrectAnswers(c => c + 1);
      nextRound();
    } else {
      // Wrong swipe - penalty
      setWrongAnswers(w => w + 1);
      setScore(prevScore => Math.max(0, prevScore - 100));
    }
  };

  if (gameOver && gameEndTime) {
    const stats = calculateStats();
    const totalTime = gameEndTime - gameStartTime;
    const accuracy = correctAnswers > 0 ? Math.round((correctAnswers / (correctAnswers + wrongAnswers)) * 100) : 0;
    
    return (
      <div className="w-full min-h-[calc(100vh-10rem)] flex items-center justify-center bg-luxury-black p-6">
        <div className="w-full max-w-md bg-luxury-black rounded-2xl shadow-2xl border-2 border-luxury-gold p-6 flex flex-col items-center animate-fade-in">
          {/* Best Results & Tips Section */}
          <div className="w-full mb-4 p-3 rounded-lg bg-luxury-gold/10 border border-luxury-gold/40 text-center">
            <div className="text-base font-semibold text-luxury-gold mb-1">How to Get the Best Results</div>
            <div className="text-sm text-luxury-white/80 mb-1">
              Tap the arrow that matches the direction shown above. The faster you react, the higher your score!
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}ms average reaction
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Swipe Results</div>
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
              <span className="text-luxury-white/60">Rounds:</span>
              <span>{rounds}/{totalRounds}</span>
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
              onClick={() => navigator.share && navigator.share({ title: 'Swipe Results', text: `Score: ${score}, Accuracy: ${accuracy}%, Avg: ${stats?.average ?? 0}ms`, url: window.location.href })}
            >
              Share
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-8">
      <div className="text-center space-y-2">
        <div className="text-lg">Score: {score}</div>
        <div className="text-sm text-luxury-white/70">
          Round {rounds + 1}/{totalRounds}
        </div>
      </div>
      
      <div className="relative w-80 h-80 rounded-xl border-2 border-luxury-white/20 bg-luxury-black flex items-center justify-center">
        {showDirection && currentDirection ? (
          <div className="text-luxury-gold animate-pulse">
            {getDirectionIcon(currentDirection)}
          </div>
        ) : (
          <div className="text-luxury-white/30">
            <div className="text-lg">Get Ready...</div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-4 w-48">
        <div></div>
        <button
          onClick={() => handleSwipe('up')}
          className="btn-outline h-12 w-12 p-0"
          disabled={!showDirection}
        >
          <ArrowUp className="h-6 w-6" />
        </button>
        <div></div>
        
        <button
          onClick={() => handleSwipe('left')}
          className="btn-outline h-12 w-12 p-0"
          disabled={!showDirection}
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => handleSwipe('down')}
          className="btn-outline h-12 w-12 p-0"
          disabled={!showDirection}
        >
          <ArrowDown className="h-6 w-6" />
        </button>
        <button
          onClick={() => handleSwipe('right')}
          className="btn-outline h-12 w-12 p-0"
          disabled={!showDirection}
        >
          <ArrowRight className="h-6 w-6" />
        </button>
        
        <div></div>
        <div className="text-xs text-luxury-white/50 text-center">
          Tap the arrow shown above
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default SwipeGame;
