
import React, { useState, useEffect, useCallback } from "react";

interface ClickLimitGameProps {
  onFinish: (score: number, time: number) => void;
}

const ClickLimitGame: React.FC<ClickLimitGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [clickCount, setClickCount] = useState<number>(0);
  const [targetClicks, setTargetClicks] = useState<number>(20);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [gameOver, setGameOver] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [clickTimes, setClickTimes] = useState<number[]>([]);
  const [lastClickTime, setLastClickTime] = useState<number>(0);

  const reactionTimeBenchmarks = {
    worldClass: 100,
    excellent: 150,
    good: 200,
    average: 250,
    slow: 300,
    verySlow: 400
  };

  const calculateStats = () => {
    if (clickTimes.length === 0) return null;
    
    const average = Math.round(clickTimes.reduce((a, b) => a + b, 0) / clickTimes.length);
    const best = Math.min(...clickTimes);
    const worst = Math.max(...clickTimes);
    const accuracy = correctAnswers > 0 ? Math.round((correctAnswers / (correctAnswers + wrongAnswers)) * 100) : 0;
    const clicksPerSecond = clickTimes.length > 0 ? (clickTimes.length / (clickTimes.reduce((a, b) => a + b, 0) / 1000)).toFixed(1) : '0';
    
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
      clicksPerSecond,
      performanceRating,
      ratingColor,
      benchmarks: reactionTimeBenchmarks
    };
  };

  const startRound = useCallback(() => {
    const newTarget = 15 + round * 5; // Increasing difficulty
    setTargetClicks(newTarget);
    setClickCount(0);
    setTimeLeft(10);
    setIsActive(true);
    setRoundStartTime(Date.now());
    setLastClickTime(Date.now());
  }, [round]);

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
    } else if (timeLeft === 0) {
      endRound();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isActive]);

  const endRound = () => {
    setIsActive(false);
    const success = clickCount >= targetClicks;
    const timeTaken = (Date.now() - roundStartTime) / 1000;
    
    if (success) {
      const roundScore = Math.floor(100 + (clickCount - targetClicks) * 5 + (10 - timeTaken) * 10);
      setScore(prevScore => prevScore + roundScore);
      setCorrectAnswers(c => c + 1);
      setFeedback(`Success! +${roundScore} points`);
    } else {
      setWrongAnswers(w => w + 1);
      setFeedback(`Failed! Only ${clickCount}/${targetClicks} clicks`);
    }

    setTimeout(() => {
      setFeedback("");
      if (round < 5) {
        setRound(prev => prev + 1);
        startRound();
      } else {
        setGameOver(true);
        setGameEndTime(Date.now());
      }
    }, 2000);
  };

  const handleClick = () => {
    if (isActive) {
      const currentTime = Date.now();
      const timeSinceLastClick = currentTime - lastClickTime;
      if (timeSinceLastClick > 50) { // Prevent multiple clicks in quick succession
        setClickTimes(prev => [...prev, timeSinceLastClick]);
        setLastClickTime(currentTime);
      }
      
      setClickCount(prev => prev + 1);
      if (clickCount + 1 >= targetClicks) {
        endRound();
      }
    }
  };

  const progressPercentage = (clickCount / targetClicks) * 100;

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
              Click as fast as possible to reach the target before time runs out. Maintain a steady rhythm for maximum clicks!
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}ms average interval
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Click Limit Results</div>
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
              <span className="text-luxury-white/60">Success:</span>
              <span className="text-green-400">{correctAnswers}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Failed:</span>
              <span className="text-red-400">{wrongAnswers}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Rounds:</span>
              <span>{round}/5</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Clicks/Second:</span>
              <span className="font-semibold text-luxury-gold">{stats?.clicksPerSecond ?? 0}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Avg. Interval:</span>
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
              <div className="text-sm text-luxury-gold mb-1 font-semibold">Click Intervals (ms):</div>
              <div className="flex flex-wrap gap-2 text-xs text-luxury-white/80">
                {clickTimes.map((t, i) => (
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
              onClick={() => navigator.share && navigator.share({ title: 'Click Limit Results', text: `Score: ${score}, Clicks/s: ${stats?.clicksPerSecond ?? 0}, Avg: ${stats?.average ?? 0}ms`, url: window.location.href })}
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
        <div className="text-sm text-luxury-white/70">Round: {round}/5</div>
        {feedback && (
          <div className={`text-sm font-medium ${feedback.includes("Success") ? "text-green-400" : "text-red-400"}`}>
            {feedback}
          </div>
        )}
      </div>

      <div className="text-center space-y-2">
        <div className="text-2xl font-bold text-luxury-gold">{timeLeft}s</div>
        <div className="text-lg">
          {clickCount} / {targetClicks}
        </div>
        
        {/* Progress Bar */}
        <div className="w-64 h-4 bg-luxury-black border border-luxury-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-luxury-gold to-green-400 transition-all duration-300"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      <button
        onClick={handleClick}
        disabled={!isActive}
        className={`w-64 h-64 rounded-full border-4 text-2xl font-bold transition-all duration-100 active:scale-95 ${
          isActive
            ? "bg-luxury-gold border-luxury-gold/80 text-luxury-black hover:bg-luxury-gold/90 shadow-[0_0_30px_rgba(191,175,128,0.5)]"
            : "bg-luxury-black border-luxury-white/20 text-luxury-white/50"
        }`}
      >
        {isActive ? "CLICK!" : "READY"}
      </button>

      <div className="text-center text-xs text-luxury-white/50">
        Click as fast as possible to reach the target before time runs out
      </div>
    </div>
  );
};

export default ClickLimitGame;
