
import React, { useState, useEffect, useCallback } from "react";

interface SameShapesGameProps {
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

const SameShapesGame: React.FC<SameShapesGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [shapes, setShapes] = useState<Array<{ id: number; shape: string; color: string }>>([]);
  const [targetShape, setTargetShape] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [wrongAnswers, setWrongAnswers] = useState<number>(0);

  const shapeTypes = ['●', '■', '▲', '◆', '★', '♦'];
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

  const generateRound = useCallback(() => {
    const target = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    const newShapes = [];
    
    // Generate 6 shapes with one being the target
    for (let i = 0; i < 6; i++) {
      const shape = i === 0 ? target : shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      newShapes.push({ id: i, shape, color });
    }
    
    // Shuffle the array
    for (let i = newShapes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newShapes[i], newShapes[j]] = [newShapes[j], newShapes[i]];
    }
    
    setShapes(newShapes);
    setTargetShape(target);
    setFeedback("");
    setRoundStartTime(Date.now());
  }, []);

  useEffect(() => {
    setGameStartTime(Date.now());
    generateRound();
  }, [generateRound]);

  const handleShapeClick = (clickedShape: { id: number; shape: string; color: string }) => {
    const reactionTime = Date.now() - roundStartTime;
    
    if (clickedShape.shape === targetShape) {
      const roundScore = Math.floor(100 + Math.max(0, (3 - reactionTime / 1000) * 20));
      setScore(prevScore => prevScore + roundScore);
      setCorrectAnswers(prev => prev + 1);
      setReactionTimes(prev => [...prev, reactionTime]);
      setFeedback(`Correct! +${roundScore}`);
    } else {
      setWrongAnswers(prev => prev + 1);
      setFeedback(`Wrong! Target was ${targetShape}`);
    }

    setTimeout(() => {
      setFeedback("");
      if (round < 8) {
        setRound(prev => prev + 1);
        generateRound();
      } else {
        setGameOver(true);
        setGameEndTime(Date.now());
      }
    }, 1500);
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
              Find the shape that matches the target as quickly as possible. Visual recognition speed matters!
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}ms average reaction
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Same Shapes Results</div>
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
              onClick={() => navigator.share && navigator.share({ title: 'Same Shapes Results', text: `Score: ${score}, Correct: ${correctAnswers}, Avg: ${stats?.average ?? 0}ms`, url: window.location.href })}
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

      <div className="text-center space-y-2">
        <div className="text-2xl font-bold text-luxury-gold">Find this shape:</div>
        <div className="text-6xl text-luxury-gold">{targetShape}</div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-80">
        {shapes.map((shape) => (
          <button
            key={shape.id}
            onClick={() => handleShapeClick(shape)}
            className={`
              w-20 h-20 bg-luxury-black border-2 rounded-lg text-3xl font-bold transition-all
              ${shape.color === 'red' ? 'border-red-500 text-red-500' : 
                shape.color === 'blue' ? 'border-blue-500 text-blue-500' :
                shape.color === 'green' ? 'border-green-500 text-green-500' :
                shape.color === 'yellow' ? 'border-yellow-500 text-yellow-500' :
                shape.color === 'purple' ? 'border-purple-500 text-purple-500' :
                'border-orange-500 text-orange-500'
              }
              hover:scale-105 active:scale-95
            `}
          >
            {shape.shape}
          </button>
        ))}
      </div>

      <div className="text-center text-xs text-luxury-white/50">
        Click the shape that matches the target
      </div>
    </div>
  );
};

export default SameShapesGame;
