
import React, { useState, useEffect, useCallback } from "react";

interface FastClickGameProps {
  onFinish: (score: number, time: number) => void;
}

const BUTTON_COLORS = ['red', 'blue', 'green', 'yellow'];

const reactionTimeBenchmarks = {
  worldClass: 230,
  excellent: 260,
  good: 300,
  average: 350,
  slow: 400,
  verySlow: 500
};

const FastClickGame: React.FC<FastClickGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [targetColor, setTargetColor] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(3);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [wrongClicks, setWrongClicks] = useState<number>(0);

  const getColorClasses = (color: string, isTarget: boolean = false) => {
    const baseClasses = "w-32 h-32 rounded-lg font-bold text-white transition-all active:scale-95";
    switch (color) {
      case 'red':
        return `${baseClasses} ${isTarget ? 'bg-red-500 hover:bg-red-600' : 'bg-red-500/30'}`;
      case 'blue':
        return `${baseClasses} ${isTarget ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-500/30'}`;
      case 'green':
        return `${baseClasses} ${isTarget ? 'bg-green-500 hover:bg-green-600' : 'bg-green-500/30'}`;
      case 'yellow':
        return `${baseClasses} ${isTarget ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-yellow-500/30'}`;
      default:
        return baseClasses;
    }
  };

  const startRound = useCallback(() => {
    const newTarget = BUTTON_COLORS[Math.floor(Math.random() * BUTTON_COLORS.length)];
    setTargetColor(newTarget);
    setTimeLeft(3);
    setIsActive(true);
    setRoundStartTime(Date.now());
  }, []);

  useEffect(() => {
    setGameStartTime(Date.now());
    startRound();
  }, [startRound]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Time's up
      setIsActive(false);
      setFeedback("Too slow!");
      setTimeout(() => {
        nextRound();
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isActive]);

  const handleButtonClick = (clickedColor: string) => {
    if (!isActive) return;
    
    setIsActive(false);
    const reactionTime = Date.now() - roundStartTime;
    
    if (clickedColor === targetColor) {
      const roundScore = Math.floor(200 - reactionTime / 10); // Max 200 points, decreases with time
      setScore(prevScore => prevScore + Math.max(roundScore, 10));
      setReactionTimes(prev => [...prev, reactionTime]);
      setFeedback(`Correct! +${Math.max(roundScore, 10)} (${reactionTime}ms)`);
    } else {
      setWrongClicks(prev => prev + 1);
      setFeedback("Wrong button!");
    }
    
    setTimeout(() => {
      nextRound();
    }, 1500);
  };

  const nextRound = () => {
    setFeedback("");
    if (round < 10) {
      setRound(prev => prev + 1);
      startRound();
    } else {
      setGameOver(true);
      setGameEndTime(Date.now());
    }
  };

  // Calculate stats
  const calculateStats = () => {
    if (reactionTimes.length === 0) return null;
    const sum = reactionTimes.reduce((a, b) => a + b, 0);
    const average = Math.round(sum / reactionTimes.length);
    const best = Math.min(...reactionTimes);
    const worst = Math.max(...reactionTimes);
    const vsWorldClass = average - reactionTimeBenchmarks.worldClass;
    const percentageSlower = Math.round((vsWorldClass / reactionTimeBenchmarks.worldClass) * 100);
    let performanceRating = "";
    if (average <= reactionTimeBenchmarks.worldClass) {
      performanceRating = "World Class";
    } else if (average <= reactionTimeBenchmarks.excellent) {
      performanceRating = "Excellent";
    } else if (average <= reactionTimeBenchmarks.good) {
      performanceRating = "Good";
    } else if (average <= reactionTimeBenchmarks.average) {
      performanceRating = "Average";
    } else if (average <= reactionTimeBenchmarks.slow) {
      performanceRating = "Slow";
    } else {
      performanceRating = "Very Slow";
    }
    return {
      average,
      best,
      worst,
      vsWorldClass,
      percentageSlower,
      performanceRating,
      benchmarks: reactionTimeBenchmarks
    };
  };

  if (gameOver) {
    const totalTimeMs = gameEndTime && gameStartTime ? gameEndTime - gameStartTime : 0;
    const stats = calculateStats();
    return (
      <div className="w-full min-h-[calc(100vh-10rem)] flex items-center justify-center bg-luxury-black p-6">
        <div className="w-full max-w-md bg-luxury-black rounded-2xl shadow-2xl border-2 border-luxury-gold p-6 flex flex-col items-center animate-fade-in">
          {/* Best Results & Tips Section */}
          <div className="w-full mb-4 p-3 rounded-lg bg-luxury-gold/10 border border-luxury-gold/40 text-center">
            <div className="text-base font-semibold text-luxury-gold mb-1">How to Get the Best Results</div>
            <div className="text-sm text-luxury-white/80 mb-1">
              Click the correct colored button as quickly as possible. Speed and accuracy matter!
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}ms average reaction
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Fast Click Results</div>
          </div>
          <div className="w-full flex flex-col gap-2 mb-4">
            <div className="flex justify-between text-lg">
              <span className="text-luxury-white/80">Final Score:</span>
              <span className="font-bold text-luxury-gold">{score}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Correct Clicks:</span>
              <span>{reactionTimes.length}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Wrong Clicks:</span>
              <span className="text-red-400">{wrongClicks}</span>
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
              <span>{(totalTimeMs / 1000).toFixed(2)}s</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Performance:</span>
              <span className="font-semibold text-luxury-gold">{stats?.performanceRating}</span>
            </div>
          </div>
          <button
            className="text-xs text-luxury-gold underline mb-2 focus:outline-none"
            onClick={() => setShowDetails((v) => !v)}
          >
            {showDetails ? "Hide Details" : "Show Detailed Stats"}
          </button>
          {showDetails && (
            <div className="w-full bg-luxury-black/80 rounded-lg border border-luxury-gold/30 p-3 mb-2 max-h-48 overflow-y-auto animate-fade-in">
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
              onClick={() => navigator.share && navigator.share({ title: 'Fast Click Results', text: `Score: ${score}, Correct: ${reactionTimes.length}, Avg: ${stats?.average ?? 0}ms`, url: window.location.href })}
            >
              Share
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-6">
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
        <div className="text-2xl font-bold text-luxury-gold">{timeLeft}s</div>
        <div className="text-lg text-luxury-white">
          Click the <span className="font-bold text-luxury-gold">{targetColor}</span> button!
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {BUTTON_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => handleButtonClick(color)}
            disabled={!isActive}
            className={getColorClasses(color, isActive)}
          >
            {color.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="text-center text-xs text-luxury-white/50">
        Click the correct colored button as fast as possible
      </div>
    </div>
  );
};

export default FastClickGame;
