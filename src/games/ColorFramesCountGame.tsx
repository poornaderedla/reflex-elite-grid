
import React, { useState, useEffect, useCallback } from "react";

interface ColorFramesCountGameProps {
  onFinish: (score: number, time: number) => void;
}

const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

const ColorFramesCountGame: React.FC<ColorFramesCountGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [frames, setFrames] = useState<string[]>([]);
  const [targetColor, setTargetColor] = useState<string>("");
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [showFrames, setShowFrames] = useState<boolean>(true);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [gameOver, setGameOver] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);

  const reactionTimeBenchmarks = {
    worldClass: 2.0,
    excellent: 2.5,
    good: 3.0,
    average: 3.5,
    slow: 4.0,
    verySlow: 5.0
  };

  const calculateStats = () => {
    if (reactionTimes.length === 0) return null;
    
    const average = Math.round((reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) * 100) / 100;
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

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-500';
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'purple': return 'bg-purple-500';
      case 'orange': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const generateRound = useCallback(() => {
    const target = COLORS[Math.floor(Math.random() * COLORS.length)];
    const gridFrames: string[] = [];
    
    // Add target color frames
    const targetCount = 3 + Math.floor(Math.random() * 6); // 3-8 target frames
    for (let i = 0; i < targetCount; i++) {
      gridFrames.push(target);
    }
    
    // Fill remaining slots with other colors
    while (gridFrames.length < 20) {
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      gridFrames.push(randomColor);
    }
    
    // Shuffle array
    for (let i = gridFrames.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gridFrames[i], gridFrames[j]] = [gridFrames[j], gridFrames[i]];
    }
    
    setFrames(gridFrames);
    setTargetColor(target);
    setCorrectCount(targetCount);
    setUserAnswer("");
    setShowFrames(true);
    setRoundStartTime(Date.now());
    
    // Hide frames after 3 seconds
    setTimeout(() => {
      setShowFrames(false);
    }, 3000);
  }, []);

  useEffect(() => {
    setGameStartTime(Date.now());
    generateRound();
  }, [generateRound]);

  const handleSubmit = () => {
    const userCount = parseInt(userAnswer);
    const timeTaken = (Date.now() - roundStartTime) / 1000;
    
    if (userCount === correctCount) {
      const roundScore = Math.floor(100 + Math.max(0, (6 - timeTaken) * 10));
      setScore(prevScore => prevScore + roundScore);
      setReactionTimes(prev => [...prev, timeTaken]);
      setCorrectAnswers(c => c + 1);
      setFeedback(`Correct! ${correctCount} ${targetColor} frames (+${roundScore})`);
    } else {
      setWrongAnswers(w => w + 1);
      setFeedback(`Wrong! It was ${correctCount} ${targetColor} frames`);
    }

    setTimeout(() => {
      setFeedback("");
      if (round < 7) {
        setRound(prev => prev + 1);
        generateRound();
      } else {
        setGameOver(true);
        setGameEndTime(Date.now());
      }
    }, 2000);
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
              Count the target colored frames quickly and accurately. Focus on the specific color and count carefully!
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}s average time
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Color Frames Count Results</div>
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
              <span className="text-luxury-white/60">Avg. Time:</span>
              <span>{stats?.average ?? 0}s</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Best:</span>
              <span>{stats?.best ?? 0}s</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Worst:</span>
              <span>{stats?.worst ?? 0}s</span>
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
              <div className="text-sm text-luxury-gold mb-1 font-semibold">Response Times (s):</div>
              <div className="flex flex-wrap gap-2 text-xs text-luxury-white/80">
                {reactionTimes.map((t, i) => (
                  <span key={i} className="px-2 py-1 bg-luxury-gold/10 rounded">{t.toFixed(2)}s</span>
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
              onClick={() => navigator.share && navigator.share({ title: 'Color Frames Count Results', text: `Score: ${score}, Accuracy: ${accuracy}%, Avg: ${stats?.average ?? 0}s`, url: window.location.href })}
            >
              Share
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-4">
      <div className="text-center space-y-2">
        <div className="text-lg">Score: {score}</div>
        <div className="text-sm text-luxury-white/70">Round: {round}/7</div>
        {feedback && (
          <div className={`text-sm font-medium ${feedback.includes("Correct") ? "text-green-400" : "text-red-400"}`}>
            {feedback}
          </div>
        )}
      </div>

      {showFrames && (
        <div className="text-center space-y-2">
          <div className="text-sm text-luxury-white/70">Count the {targetColor} frames:</div>
          <div className={`w-6 h-6 ${getColorClass(targetColor)} mx-auto rounded border-2 border-luxury-white`} />
        </div>
      )}

      <div className="w-80 h-80 bg-luxury-black border border-luxury-white/20 rounded-lg p-2">
        {showFrames ? (
          <div className="grid grid-cols-5 gap-1 h-full">
            {frames.map((color, index) => (
              <div
                key={index}
                className={`${getColorClass(color)} rounded border border-luxury-white/30`}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="text-sm text-luxury-white/70">How many {targetColor} frames did you see?</div>
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-20 h-12 bg-luxury-black border border-luxury-white/20 rounded-lg text-center text-xl text-luxury-white focus:border-luxury-gold/50 focus:outline-none"
                min="0"
                max="20"
              />
              <button
                onClick={handleSubmit}
                disabled={!userAnswer}
                className="block w-full bg-luxury-gold text-luxury-black px-4 py-2 rounded-lg font-medium hover:bg-luxury-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-luxury-white/50">
        {showFrames ? `Count the ${targetColor} colored frames` : "Enter your count"}
      </div>
    </div>
  );
};

export default ColorFramesCountGame;
