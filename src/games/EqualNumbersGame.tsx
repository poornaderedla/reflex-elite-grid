
import React, { useState, useEffect, useCallback } from "react";

interface EqualNumbersGameProps {
  onFinish: (score: number, time: number) => void;
}

const reactionTimeBenchmarks = {
  worldClass: 230,
  excellent: 260,
  good: 300,
  average: 350,
  slow: 400,
  verySlow: 500
};

const EqualNumbersGame: React.FC<EqualNumbersGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [wrongAnswers, setWrongAnswers] = useState<number>(0);
  const [clickedTargetIndices, setClickedTargetIndices] = useState<number[]>([]);
  const [targetIndices, setTargetIndices] = useState<number[]>([]);

  const generateRound = useCallback(() => {
    const target = Math.floor(Math.random() * 9) + 1;
    const newNumbers = [];
    const indices: number[] = [];
    // Add 2-4 instances of target number
    const targetCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < targetCount; i++) {
      newNumbers.push(target);
      indices.push(i); // These will be shuffled, so we'll recalc below
    }
    // Fill remaining slots with random numbers (not target)
    while (newNumbers.length < 16) {
      const randomNum = Math.floor(Math.random() * 9) + 1;
      if (randomNum !== target) {
        newNumbers.push(randomNum);
      }
    }
    // Shuffle array and track target indices
    for (let i = newNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newNumbers[i], newNumbers[j]] = [newNumbers[j], newNumbers[i]];
    }
    // Find all indices of the target number in the shuffled array
    const shuffledTargetIndices = newNumbers
      .map((num, idx) => (num === target ? idx : -1))
      .filter(idx => idx !== -1);
    setNumbers(newNumbers);
    setTargetNumber(target);
    setFeedback("");
    setRoundStartTime(Date.now());
    setClickedTargetIndices([]);
    setTargetIndices(shuffledTargetIndices);
  }, []);

  useEffect(() => {
    setGameStartTime(Date.now());
    generateRound();
  }, [generateRound]);

  const handleNumberClick = (clickedNumber: number, index: number) => {
    if (clickedNumber === targetNumber && !clickedTargetIndices.includes(index)) {
      const reactionTime = Date.now() - roundStartTime;
      const roundScore = Math.floor(100 + Math.max(0, (3 - reactionTime / 1000) * 20));
      setScore(prevScore => prevScore + roundScore);
      setCorrectAnswers(prev => prev + 1);
      setReactionTimes(prev => [...prev, reactionTime]);
      setClickedTargetIndices(prev => {
        const updated = [...prev, index];
        // If all target indices have been clicked, move to next round
        if (updated.length === targetIndices.length) {
          setTimeout(() => {
            if (round < 10) {
              setRound(prev => prev + 1);
              generateRound();
            } else {
              setGameOver(true);
              setGameEndTime(Date.now());
            }
          }, 300); // Short delay for feedback
        }
        return updated;
      });
      setFeedback(`Correct! +${roundScore}`);
    } else if (clickedNumber !== targetNumber) {
      setWrongAnswers(prev => prev + 1);
      setFeedback("Wrong number!");
      setTimeout(() => setFeedback("") , 500);
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
              Find all numbers equal to the target as quickly as possible. Speed and accuracy matter!
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}ms average reaction
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Equal Numbers Results</div>
          </div>
          <div className="w-full flex flex-col gap-2 mb-4">
            <div className="flex justify-between text-lg">
              <span className="text-luxury-white/80">Final Score:</span>
              <span className="font-bold text-luxury-gold">{score}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Correct Answers:</span>
              <span>{correctAnswers}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Wrong Answers:</span>
              <span className="text-red-400">{wrongAnswers}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Accuracy:</span>
              <span>{correctAnswers + wrongAnswers > 0 ? Math.round((correctAnswers / (correctAnswers + wrongAnswers)) * 100) : 0}%</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Avg. Find Time:</span>
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
              <div className="text-sm text-luxury-gold mb-1 font-semibold">Find Times (ms):</div>
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
              onClick={() => navigator.share && navigator.share({ title: 'Equal Numbers Results', text: `Score: ${score}, Correct: ${correctAnswers}, Avg: ${stats?.average ?? 0}ms`, url: window.location.href })}
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
        <div className="text-sm text-luxury-white/70">Round: {round}/10</div>
        {feedback && (
          <div className={`text-sm font-medium ${feedback.includes("Correct") ? "text-green-400" : "text-red-400"}`}>
            {feedback}
          </div>
        )}
      </div>

      <div className="text-center space-y-2">
        <div className="text-sm text-luxury-white/70">Find all numbers equal to:</div>
        <div className="text-4xl font-bold text-luxury-gold">{targetNumber}</div>
      </div>

      <div className="grid grid-cols-4 gap-2 w-80">
        {numbers.map((number, index) => (
          <button
            key={index}
            onClick={() => handleNumberClick(number, index)}
            className={`w-18 h-18 bg-luxury-black border border-luxury-white/20 rounded-lg text-xl font-bold text-luxury-white hover:border-luxury-gold/50 hover:bg-luxury-gold/10 transition-all
              ${clickedTargetIndices.includes(index) ? 'opacity-50 pointer-events-none' : ''}`}
            disabled={clickedTargetIndices.includes(index)}
          >
            {number}
          </button>
        ))}
      </div>

      <div className="text-center text-xs text-luxury-white/50">
        Click all numbers equal to the target
      </div>
    </div>
  );
};

export default EqualNumbersGame;
