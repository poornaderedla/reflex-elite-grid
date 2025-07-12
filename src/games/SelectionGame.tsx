
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
  const [gameOver, setGameOver] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const maxRounds = 10;

  const reactionTimeBenchmarks = {
    worldClass: 1.5,
    excellent: 2.0,
    good: 2.5,
    average: 3.0,
    slow: 3.5,
    verySlow: 4.0
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
    setRoundStartTime(Date.now());
  }, []);

  useEffect(() => {
    generateRound();
  }, [round, generateRound]);
  
  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const handleSelect = (selectedNumber: number) => {
    const reactionTime = (Date.now() - roundStartTime) / 1000;
    
    if (selectedNumber === targetNumber) {
      setScore(prev => prev + 100);
      setReactionTimes(prev => [...prev, reactionTime]);
      setCorrectAnswers(c => c + 1);
      setFeedback('Correct!');
    } else {
      setWrongAnswers(w => w + 1);
      setFeedback('Wrong!');
    }

    setTimeout(() => {
      setFeedback('');
      if (round < maxRounds) {
        setRound(r => r + 1);
      } else {
        setGameOver(true);
        setGameEndTime(Date.now());
      }
    }, 500);
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
              Select the target number quickly and accurately. Focus on the number and choose the correct option!
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}s average time
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Selection Results</div>
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
              <span>{round}/{maxRounds}</span>
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
              onClick={() => navigator.share && navigator.share({ title: 'Selection Results', text: `Score: ${score}, Accuracy: ${accuracy}%, Avg: ${stats?.average ?? 0}s`, url: window.location.href })}
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
