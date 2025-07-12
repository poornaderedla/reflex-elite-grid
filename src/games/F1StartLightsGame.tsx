
import React, { useState, useEffect, useCallback } from "react";

interface F1StartLightsGameProps {
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

const F1StartLightsGame: React.FC<F1StartLightsGameProps> = ({ onFinish }) => {
  const [totalScore, setTotalScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [gameState, setGameState] = useState<"waiting" | "lights" | "go">("waiting");
  const [feedback, setFeedback] = useState<string>("");
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [falseStarts, setFalseStarts] = useState<number>(0);

  const startRound = useCallback(() => {
    setGameState("waiting");
    setFeedback("");
    
    // Random delay between 2-5 seconds
    const delay = 2000 + Math.random() * 3000;
    
    setTimeout(() => {
      setGameState("lights");
      setFeedback("Lights on! Wait for lights out...");
      
      // Lights stay on for 1-3 seconds
      const lightsDuration = 1000 + Math.random() * 2000;
      
      setTimeout(() => {
        setGameState("go");
        setStartTime(Date.now());
        setFeedback("GO!");
      }, lightsDuration);
    }, delay);
  }, []);

  useEffect(() => {
    setGameStartTime(Date.now());
    startRound();
  }, [startRound]);

  const handleReaction = () => {
    if (gameState === "go") {
      const reactionMs = Date.now() - startTime;
      setReactionTime(reactionMs);
      setReactionTimes(prev => [...prev, reactionMs]);
      
      const roundScore = Math.max(1000 - reactionMs, 100);
      setTotalScore(prev => prev + roundScore);
      setFeedback(`${reactionMs}ms (+${roundScore})`);
      
      setTimeout(() => {
        if (round < 5) {
          setRound(prev => prev + 1);
          startRound();
        } else {
          setGameOver(true);
          setGameEndTime(Date.now());
        }
      }, 1500);
    } else if (gameState === "lights") {
      // False start
      setFalseStarts(prev => prev + 1);
      setFeedback("False Start! Wait for lights out!");
      setTimeout(() => {
        startRound();
      }, 2000);
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
              Wait for all lights to go out, then react as quickly as possible. False starts will hurt your score!
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}ms average reaction
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">F1 Start Lights Results</div>
          </div>
          <div className="w-full flex flex-col gap-2 mb-4">
            <div className="flex justify-between text-lg">
              <span className="text-luxury-white/80">Final Score:</span>
              <span className="font-bold text-luxury-gold">{totalScore}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Successful Starts:</span>
              <span>{reactionTimes.length}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">False Starts:</span>
              <span className="text-red-400">{falseStarts}</span>
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
              onClick={() => navigator.share && navigator.share({ title: 'F1 Start Lights Results', text: `Score: ${totalScore}, Starts: ${reactionTimes.length}, Avg: ${stats?.average ?? 0}ms`, url: window.location.href })}
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
        <div className="text-lg">Score: {totalScore}</div>
        <div className="text-sm text-luxury-white/70">Round: {round}/5</div>
        {feedback && (
          <div className={`text-sm font-medium ${feedback.includes("GO!") ? "text-green-400" : feedback.includes("False") ? "text-red-400" : "text-yellow-400"}`}>
            {feedback}
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <div className={`w-16 h-16 rounded-full border-4 ${gameState === "lights" || gameState === "go" ? "bg-red-500" : "bg-gray-600"}`}></div>
        <div className={`w-16 h-16 rounded-full border-4 ${gameState === "lights" || gameState === "go" ? "bg-red-500" : "bg-gray-600"}`}></div>
        <div className={`w-16 h-16 rounded-full border-4 ${gameState === "lights" || gameState === "go" ? "bg-red-500" : "bg-gray-600"}`}></div>
        <div className={`w-16 h-16 rounded-full border-4 ${gameState === "lights" || gameState === "go" ? "bg-red-500" : "bg-gray-600"}`}></div>
        <div className={`w-16 h-16 rounded-full border-4 ${gameState === "lights" || gameState === "go" ? "bg-red-500" : "bg-gray-600"}`}></div>
      </div>

      <button
        onClick={handleReaction}
        className="w-32 h-32 bg-luxury-gold text-luxury-black font-bold text-xl rounded-full hover:bg-yellow-400 transition-all active:scale-95"
      >
        {gameState === "waiting" ? "Wait..." : gameState === "lights" ? "Wait!" : "GO!"}
      </button>

      <div className="text-center text-xs text-luxury-white/50">
        Wait for all lights to go out, then tap as fast as possible
      </div>
    </div>
  );
};

export default F1StartLightsGame;
