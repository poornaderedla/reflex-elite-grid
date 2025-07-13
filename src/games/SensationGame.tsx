
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Zap, Circle } from "lucide-react";

interface SensationGameProps {
  onFinish: (score: number, time: number) => void;
}

const TOTAL_ROUNDS = 10;
const ZONES = Array.from({ length: 9 }, (_, i) => i); // 3x3 grid
const REACTION_BENCHMARKS = {
  worldClass: 300,
  excellent: 400,
  good: 500,
  average: 600,
  slow: 700,
  verySlow: 800,
};

const getResponseTime = (round: number) => {
  const min = 2000, max = 6000;
  return Math.max(min, max - ((max - min) * (round / (TOTAL_ROUNDS - 1))));
};

const SensationGame: React.FC<SensationGameProps> = ({ onFinish }) => {
  // State
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [activeZone, setActiveZone] = useState<number | null>(null);
  const [isWaiting, setIsWaiting] = useState(true);
  const [isTransition, setIsTransition] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(3);
  const [triggerTime, setTriggerTime] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [lastReaction, setLastReaction] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStart, setGameStart] = useState<number>(0);
  const [gameEnd, setGameEnd] = useState<number>(0);
  const [showDetails, setShowDetails] = useState(false);

  // Refs for timeouts/intervals
  const timeouts = useRef<NodeJS.Timeout[]>([]);
  const interval = useRef<NodeJS.Timeout | null>(null);
  const gameOverRef = useRef(false);

  // Cleanup
  const clearAll = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    if (interval.current) clearInterval(interval.current);
    interval.current = null;
  };

  // Start 3-2-1 countdown
  const startCountdown = useCallback((onDone: () => void) => {
    setIsTransition(true);
    setCountdown(3);
    let count = 3;
    interval.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(interval.current!);
        interval.current = null;
        setIsTransition(false);
        setCountdown(null);
        onDone();
      }
    }, 800); // 2.4s total
  }, []);

  // Start a round
  const startRound = useCallback(() => {
    if (gameOverRef.current) return;
    setRound(prev => prev + 1);
    setIsWaiting(false);
    const zone = Math.floor(Math.random() * ZONES.length);
    setActiveZone(zone);
    setTriggerTime(Date.now());
    // Auto-advance if no response
    const responseTime = getResponseTime(round + 1); // round+1 because round is incremented now
    const auto = setTimeout(() => {
      if (!gameOverRef.current && activeZone !== null) {
        handleAdvance(false);
      }
    }, responseTime);
    timeouts.current.push(auto);
  }, [activeZone]);

  // Advance to next round
  const handleAdvance = useCallback((wasCorrect: boolean) => {
    clearAll();
    setActiveZone(null);
    setIsWaiting(true);
    setTriggerTime(0);
    setTimeout(() => {
      if (round >= TOTAL_ROUNDS) {
        setGameOver(true);
        setGameEnd(Date.now());
        gameOverRef.current = true;
      } else {
        startCountdown(() => startRound());
      }
    }, 0);
  }, [startCountdown, startRound]);

  // Handle user click
  const handleZoneTouch = (zone: number) => {
    if (isTransition || isWaiting || activeZone === null || gameOverRef.current) return;
    if (zone === activeZone) {
      // Correct
      const reaction = Date.now() - triggerTime;
      setLastReaction(reaction);
      setReactionTimes(r => [...r, reaction]);
      setScore(s => s + Math.max(100, Math.floor(1000 - reaction / 2)));
      setCorrect(c => c + 1);
      handleAdvance(true);
    } else {
      // Wrong
      setWrong(w => w + 1);
      setScore(s => Math.max(0, s - 25));
      // Tactile feedback
      const el = document.querySelector(`[data-zone="${zone}"]`) as HTMLElement;
      if (el) {
        el.style.transform = 'scale(0.9)';
        el.style.borderColor = '#ef4444';
        setTimeout(() => {
          el.style.transform = 'scale(1)';
          el.style.borderColor = '';
        }, 200);
      }
    }
  };

  // Game start
  useEffect(() => {
    setGameStart(Date.now());
    setGameOver(false);
    setScore(0);
    setRound(0);
    setCorrect(0);
    setWrong(0);
    setReactionTimes([]);
    setLastReaction(null);
    setActiveZone(null);
    setIsWaiting(true);
    setShowDetails(false);
    gameOverRef.current = false;
    clearAll();
    startCountdown(() => startRound());
    return clearAll;
  }, [startCountdown, startRound]);

  // Stats
  const stats = (() => {
    if (reactionTimes.length === 0) return null;
    const avg = Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);
    const best = Math.min(...reactionTimes);
    const worst = Math.max(...reactionTimes);
    const accuracy = correct > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;
    let rating = 'Very Slow', color = 'text-red-400';
    if (avg <= REACTION_BENCHMARKS.worldClass) { rating = 'World Class'; color = 'text-purple-400'; }
    else if (avg <= REACTION_BENCHMARKS.excellent) { rating = 'Excellent'; color = 'text-blue-400'; }
    else if (avg <= REACTION_BENCHMARKS.good) { rating = 'Good'; color = 'text-green-400'; }
    else if (avg <= REACTION_BENCHMARKS.average) { rating = 'Average'; color = 'text-yellow-400'; }
    else if (avg <= REACTION_BENCHMARKS.slow) { rating = 'Slow'; color = 'text-orange-400'; }
    return { avg, best, worst, accuracy, rating, color };
  })();

  // Game over screen
  if (gameOver && gameEnd) {
    const totalTime = Math.max(0, gameEnd - gameStart);
    return (
      <div className="w-full min-h-[calc(100vh-10rem)] flex items-center justify-center bg-luxury-black p-6">
        <div className="w-full max-w-md bg-luxury-black rounded-2xl shadow-2xl border-2 border-luxury-gold p-6 flex flex-col items-center animate-fade-in">
          {/* Best Results & Tips Section */}
          <div className="w-full mb-4 p-3 rounded-lg bg-luxury-gold/10 border border-luxury-gold/40 text-center">
            <div className="text-base font-semibold text-luxury-gold mb-1">How to Get the Best Results</div>
            <div className="text-sm text-luxury-white/80 mb-1">
              React quickly to visual tactile triggers. Touch the active zone as soon as you see the sensation!
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {REACTION_BENCHMARKS.worldClass}ms average reaction
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Sensation Results</div>
          </div>
          <div className="w-full bg-luxury-black/50 rounded-lg border border-luxury-gold/30 p-4 mb-4">
            <div className="flex justify-between text-lg">
              <span className="text-luxury-white/80">Final Score:</span>
              <span className="font-bold text-luxury-gold">{Math.max(0, score)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Accuracy:</span>
              <span className="font-semibold text-luxury-gold">{stats?.accuracy ?? 0}%</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Correct Answers:</span>
              <span className="text-green-400">{correct}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Wrong Answers:</span>
              <span className="text-red-400">{wrong}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Rounds Completed:</span>
              <span>{round}/{TOTAL_ROUNDS}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Average Reaction:</span>
              <span>{stats?.avg ?? 0}ms</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Best Reaction:</span>
              <span className="text-green-400">{stats?.best ?? 0}ms</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Slowest Reaction:</span>
              <span className="text-red-400">{stats?.worst ?? 0}ms</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Total Time:</span>
              <span>{(totalTime / 1000).toFixed(1)}s</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Performance Level:</span>
              <span className={`font-semibold ${stats?.color ?? 'text-luxury-gold'}`}>{stats?.rating}</span>
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
              <div className="text-sm text-luxury-gold mb-1 font-semibold">All Reaction Times (ms):</div>
              <div className="flex flex-wrap gap-2 text-xs text-luxury-white/80">
                {reactionTimes.map((t, i) => (
                  <span key={i} className={`px-2 py-1 rounded ${
                    t <= REACTION_BENCHMARKS.worldClass ? 'bg-purple-500/20 text-purple-300' :
                    t <= REACTION_BENCHMARKS.excellent ? 'bg-blue-500/20 text-blue-300' :
                    t <= REACTION_BENCHMARKS.good ? 'bg-green-500/20 text-green-300' :
                    t <= REACTION_BENCHMARKS.average ? 'bg-yellow-500/20 text-yellow-300' :
                    t <= REACTION_BENCHMARKS.slow ? 'bg-orange-500/20 text-orange-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>{t}</span>
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
              onClick={() => navigator.share && navigator.share({ title: 'Sensation Results', text: `Score: ${score}, Accuracy: ${stats?.accuracy ?? 0}%, Avg: ${stats?.avg ?? 0}ms`, url: window.location.href })}
            >
              Share
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main game UI
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-6 relative">
      {/* Countdown overlay */}
      {isTransition && countdown !== null && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50">
          <div className="text-4xl text-luxury-gold font-bold animate-pulse">
            Next Round in {countdown}...
          </div>
        </div>
      )}
      <div className="text-center space-y-2">
        <div className="text-lg font-bold text-luxury-gold">Score: {score}</div>
        <div className="text-sm text-luxury-white/70">
          {isTransition
            ? `Round ${Math.min(round + 1, TOTAL_ROUNDS)}/${TOTAL_ROUNDS}`
            : `Round ${round}/${TOTAL_ROUNDS}`}
        </div>
        {lastReaction !== null && (
          <div className="text-sm text-luxury-gold">Last Reaction: {lastReaction}ms</div>
        )}
      </div>
      {/* Only show grid if not in transition */}
      {!isTransition && (
        <div className="grid grid-cols-3 gap-3 w-80 h-80">
          {ZONES.map((zone) => (
            <div
              key={zone}
              className={`relative border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                activeZone === zone
                  ? 'border-luxury-gold bg-luxury-gold/30 animate-pulse shadow-lg shadow-luxury-gold/50 scale-105'
                  : 'border-luxury-white/20 bg-luxury-white/5 hover:border-luxury-white/40 hover:bg-luxury-white/10 hover:scale-105'
              }`}
              data-zone={zone}
              onClick={() => handleZoneTouch(zone)}
              style={{
                transform: activeZone === zone ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.3s ease-in-out'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {activeZone === zone ? (
                  <Zap className="h-10 w-10 text-luxury-gold animate-bounce" />
                ) : (
                  <Circle className="h-8 w-8 text-luxury-white/30" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="text-center space-y-2">
        <div className="text-sm text-luxury-white/70">
          {isWaiting ? "Wait for the sensation..." : isTransition ? "" : `Touch the active zone! You have ${(getResponseTime(round)/1000).toFixed(1)}s!`}
        </div>
        <div className="text-xs text-luxury-white/50">
          React to visual tactile triggers - Take your time!
        </div>
      </div>
    </div>
  );
};

export default SensationGame;
