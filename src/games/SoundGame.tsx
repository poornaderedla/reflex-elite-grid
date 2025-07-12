
import React, { useState, useEffect, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface SoundGameProps {
  onFinish: (score: number, time: number) => void;
}

const SoundGame: React.FC<SoundGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [soundPlayed, setSoundPlayed] = useState<boolean>(false);
  const [rounds, setRounds] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [soundTime, setSoundTime] = useState<number>(0);
  const [gameOver, setGameOver] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);

  const totalRounds = 8;

  const reactionTimeBenchmarks = {
    worldClass: 300,
    excellent: 350,
    good: 400,
    average: 450,
    slow: 500,
    verySlow: 600
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

  const playSound = useCallback(() => {
    // Visual sound indication since we can't play actual audio
    setSoundPlayed(true);
    setSoundTime(Date.now());
    
    // Auto-advance if no tap within 2 seconds
    setTimeout(() => {
      if (soundPlayed) {
        nextRound();
      }
    }, 2000);
  }, [soundPlayed]);

  const nextRound = useCallback(() => {
    setIsListening(false);
    setSoundPlayed(false);
    setRounds(prevRounds => {
      const newRounds = prevRounds + 1;
      if (newRounds >= totalRounds) {
        setGameOver(true);
        setGameEndTime(Date.now());
        return prevRounds;
      } else {
        // Start next round after delay
        setTimeout(() => {
          const delay = Math.random() * 3000 + 2000; // 2-5 seconds
          setCountdown(Math.ceil(delay / 1000));
          setIsListening(true);
          
          setTimeout(playSound, delay);
        }, 1000);
        return newRounds;
      }
    });
  }, [playSound]);

  useEffect(() => {
    setGameStartTime(Date.now());
    // Start first round
    const delay = Math.random() * 3000 + 2000;
    setCountdown(Math.ceil(delay / 1000));
    setIsListening(true);
    setTimeout(playSound, delay);
  }, [playSound]);

  useEffect(() => {
    if (isListening && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isListening, countdown]);

  const handleTap = () => {
    if (!isListening) return;
    
    if (soundPlayed && soundTime) {
      // Correct tap
      const reaction = Date.now() - soundTime;
      setReactionTime(reaction);
      setReactionTimes(prev => [...prev, reaction]);
      setCorrectAnswers(c => c + 1);
      const points = Math.max(0, Math.floor(1000 - reaction));
      setScore(prevScore => prevScore + points);
      nextRound();
    } else {
      // Early tap - penalty
      setWrongAnswers(w => w + 1);
      setScore(prevScore => Math.max(0, prevScore - 100));
    }
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
              Tap as soon as you see the sound indicator. The faster you react, the higher your score! Early taps will reduce your score.
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}ms average reaction
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Sound Results</div>
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
              <span>{rounds}/{totalRounds}</span>
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
              onClick={() => navigator.share && navigator.share({ title: 'Sound Results', text: `Score: ${score}, Accuracy: ${accuracy}%, Avg: ${stats?.average ?? 0}ms`, url: window.location.href })}
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
        <div className="text-sm text-luxury-white/70">
          Round {rounds + 1}/{totalRounds}
        </div>
      </div>
      
      <div 
        className={`relative w-64 h-64 rounded-full border-4 transition-all duration-300 cursor-pointer ${
          soundPlayed 
            ? 'border-luxury-gold bg-luxury-gold/20 animate-pulse' 
            : isListening 
              ? 'border-luxury-white/30 bg-luxury-white/5' 
              : 'border-luxury-white/10 bg-luxury-black'
        }`}
        onClick={handleTap}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {soundPlayed ? (
            <>
              <Volume2 className="h-16 w-16 text-luxury-gold mb-2" />
              <div className="text-luxury-gold font-bold">TAP NOW!</div>
            </>
          ) : isListening ? (
            <>
              <VolumeX className="h-16 w-16 text-luxury-white/50 mb-2" />
              <div className="text-luxury-white/70">Listen...</div>
              {countdown > 0 && (
                <div className="text-sm mt-2">{countdown}</div>
              )}
            </>
          ) : (
            <>
              <VolumeX className="h-16 w-16 text-luxury-white/30 mb-2" />
              <div className="text-luxury-white/50">Get Ready</div>
            </>
          )}
        </div>
      </div>
      
      <div className="text-center text-sm text-luxury-white/50">
        Tap when you see the sound indicator
      </div>
      
      {reactionTime > 0 && (
        <div className="text-luxury-gold text-sm">
          Last reaction: {reactionTime}ms
        </div>
      )}
    </div>
  );
};

export default SoundGame;
