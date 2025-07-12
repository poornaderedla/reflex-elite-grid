
import React, { useState, useEffect, useCallback } from "react";

interface Table {
  id: number;
  pattern: boolean[][];
  rotated: boolean[][];
}

interface SpatialImaginationGameProps {
  onFinish: (score: number, time: number) => void;
}

const SpatialImaginationGame: React.FC<SpatialImaginationGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [tables, setTables] = useState<Table[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [gameOver, setGameOver] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);

  const reactionTimeBenchmarks = {
    worldClass: 3.0,
    excellent: 4.0,
    good: 5.0,
    average: 6.0,
    slow: 7.0,
    verySlow: 8.0
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

  const generatePattern = (size: number = 3): boolean[][] => {
    const pattern: boolean[][] = [];
    for (let i = 0; i < size; i++) {
      pattern[i] = [];
      for (let j = 0; j < size; j++) {
        pattern[i][j] = Math.random() > 0.6;
      }
    }
    return pattern;
  };

  const rotatePattern = (pattern: boolean[][]): boolean[][] => {
    const size = pattern.length;
    const rotated: boolean[][] = [];
    for (let i = 0; i < size; i++) {
      rotated[i] = [];
      for (let j = 0; j < size; j++) {
        rotated[i][j] = pattern[size - 1 - j][i];
      }
    }
    return rotated;
  };

  const generateTables = useCallback(() => {
    const originalPattern = generatePattern();
    const correctRotated = rotatePattern(originalPattern);
    
    const newTables: Table[] = [
      { id: 0, pattern: originalPattern, rotated: correctRotated },
      { id: 1, pattern: originalPattern, rotated: generatePattern() },
      { id: 2, pattern: originalPattern, rotated: generatePattern() },
    ];
    
    // Shuffle and set correct answer
    const shuffled = [...newTables].sort(() => Math.random() - 0.5);
    const correctIndex = shuffled.findIndex(table => table.id === 0);
    
    setTables(shuffled);
    setCorrectAnswer(correctIndex);
    setRoundStartTime(Date.now());
  }, []);

  useEffect(() => {
    setGameStartTime(Date.now());
    generateTables();
  }, [generateTables]);

  const handleTableClick = (tableIndex: number) => {
    const reactionTime = (Date.now() - roundStartTime) / 1000;
    
    if (tableIndex === correctAnswer) {
      setScore(prevScore => prevScore + 100);
      setReactionTimes(prev => [...prev, reactionTime]);
      setCorrectAnswers(c => c + 1);
      setFeedback("Correct! +100");
    } else {
      setWrongAnswers(w => w + 1);
      setFeedback("Wrong table!");
    }

    setTimeout(() => {
      setFeedback("");
      if (round < 8) {
        setRound(prev => prev + 1);
        generateTables();
      } else {
        setGameOver(true);
        setGameEndTime(Date.now());
      }
    }, 1000);
  };

  const renderPattern = (pattern: boolean[][], isOriginal: boolean = false) => (
    <div className={`grid grid-cols-3 gap-1 p-3 rounded-lg ${isOriginal ? 'bg-luxury-gold/10' : 'bg-luxury-black'}`}>
      {pattern.map((row, i) =>
        row.map((cell, j) => (
          <div
            key={`${i}-${j}`}
            className={`w-6 h-6 rounded border ${
              cell ? 'bg-luxury-white' : 'bg-luxury-black border-luxury-white/20'
            }`}
          />
        ))
      )}
    </div>
  );

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
              Visualize the pattern rotating 90° clockwise. Focus on the spatial relationship and find the matching rotated pattern!
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}s average time
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Spatial Imagination Results</div>
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
              <span>{round}/8</span>
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
              onClick={() => navigator.share && navigator.share({ title: 'Spatial Imagination Results', text: `Score: ${score}, Accuracy: ${accuracy}%, Avg: ${stats?.average ?? 0}s`, url: window.location.href })}
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
        <div className="text-sm text-luxury-white/70">Round: {round}/8</div>
        {feedback && (
          <div className={`text-sm font-medium ${feedback.includes("Correct") ? "text-green-400" : "text-red-400"}`}>
            {feedback}
          </div>
        )}
      </div>

      {tables.length > 0 && (
        <>
          <div className="text-center">
            <div className="text-sm text-luxury-white/70 mb-2">Original Pattern:</div>
            {renderPattern(tables[0].pattern, true)}
          </div>

          <div className="text-center text-sm text-luxury-white/70 mb-2">
            Which is the same pattern rotated 90°?
          </div>

          <div className="grid grid-cols-3 gap-4">
            {tables.map((table, index) => (
              <button
                key={index}
                onClick={() => handleTableClick(index)}
                className="p-2 rounded-lg border border-luxury-white/20 hover:border-luxury-gold/50 transition-colors"
              >
                {renderPattern(table.rotated)}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="text-center text-xs text-luxury-white/50">
        Find the pattern that matches the original when rotated 90° clockwise
      </div>
    </div>
  );
};

export default SpatialImaginationGame;
