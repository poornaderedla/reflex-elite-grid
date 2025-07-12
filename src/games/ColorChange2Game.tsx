
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
  const [gameOver, setGameOver] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const startTimeRef = useRef(0);
  const reactionTimeRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRounds = 10;

  const reactionTimeBenchmarks = {
    worldClass: 230,
    excellent: 260,
    good: 300,
    average: 350,
    slow: 400,
    verySlow: 500
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

  const startRound = useCallback(() => {
    if (round >= maxRounds) {
      setGameOver(true);
      setGameEndTime(Date.now());
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
  }, [round, maxRounds]);

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
      setWrongAnswers(w => w + 1);
      setMessage('Too soon!');
    } else {
      if (currentColor === targetColor) {
        const reactionTime = Date.now() - reactionTimeRef.current;
        const roundScore = Math.max(0, Math.floor(1000 - reactionTime));
        setScore(s => s + roundScore);
        setReactionTimes(prev => [...prev, reactionTime]);
        setCorrectAnswers(c => c + 1);
        setMessage(`Correct! +${roundScore}`);
      } else {
        setMisses(m => m + 1);
        setWrongAnswers(w => w + 1);
        setMessage('Wrong color!');
      }
    }
    setTimeout(() => {
        setRound(r => r + 1);
    }, 1000)
  };

  if (gameOver && gameEndTime) {
    const stats = calculateStats();
    const totalTime = gameEndTime - startTimeRef.current;
    const accuracy = correctAnswers > 0 ? Math.round((correctAnswers / (correctAnswers + wrongAnswers)) * 100) : 0;
    
    return (
      <div className="w-full min-h-[calc(100vh-10rem)] flex items-center justify-center bg-luxury-black p-6">
        <div className="w-full max-w-md bg-luxury-black rounded-2xl shadow-2xl border-2 border-luxury-gold p-6 flex flex-col items-center animate-fade-in">
          {/* Best Results & Tips Section */}
          <div className="w-full mb-4 p-3 rounded-lg bg-luxury-gold/10 border border-luxury-gold/40 text-center">
            <div className="text-base font-semibold text-luxury-gold mb-1">How to Get the Best Results</div>
            <div className="text-sm text-luxury-white/80 mb-1">
              Tap only the target color as quickly as possible. The faster you react, the higher your score! Wrong colors and early taps will reduce your score.
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}ms average reaction
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Color Change 2 Results</div>
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
              <span className="text-luxury-white/60">Misses:</span>
              <span className="text-red-400">{misses}</span>
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
              onClick={() => navigator.share && navigator.share({ title: 'Color Change 2 Results', text: `Score: ${score}, Accuracy: ${accuracy}%, Avg: ${stats?.average ?? 0}ms`, url: window.location.href })}
            >
              Share
            </button>
          </div>
        </div>
      </div>
    );
  }

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
