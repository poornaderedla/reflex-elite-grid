
import React, { useState, useEffect, useCallback } from "react";

interface Dot {
  id: number;
  color: string;
  x: number;
  y: number;
}

interface SixDotsGameProps {
  onFinish: (score: number, time: number) => void;
}

const SixDotsGame: React.FC<SixDotsGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [dots, setDots] = useState<Dot[]>([]);
  const [targetDot, setTargetDot] = useState<number>(-1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState<number>(0);
  const [isSequencePlaying, setIsSequencePlaying] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");
  const [gameOver, setGameOver] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);

  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

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

  const generateDots = useCallback(() => {
    const newDots: Dot[] = [];
    for (let i = 0; i < 6; i++) {
      newDots.push({
        id: i,
        color: colors[i],
        x: 50 + (i % 3) * 100,
        y: 100 + Math.floor(i / 3) * 100,
      });
    }
    setDots(newDots);

    // Generate random sequence (3-6 dots)
    const sequenceLength = 3 + Math.floor(Math.random() * 4);
    const newSequence: number[] = [];
    for (let i = 0; i < sequenceLength; i++) {
      newSequence.push(Math.floor(Math.random() * 6));
    }
    setSequence(newSequence);
    setCurrentSequenceIndex(0);
    setRoundStartTime(Date.now());
  }, []);

  const playSequence = useCallback(() => {
    setIsSequencePlaying(true);
    let index = 0;
    
    const playNext = () => {
      if (index < sequence.length) {
        setTargetDot(sequence[index]);
        setTimeout(() => {
          setTargetDot(-1);
          index++;
          setTimeout(playNext, 500);
        }, 800);
      } else {
        setIsSequencePlaying(false);
        setTargetDot(-1);
      }
    };
    
    setTimeout(playNext, 1000);
  }, [sequence]);

  useEffect(() => {
    setGameStartTime(Date.now());
    generateDots();
  }, [generateDots]);

  useEffect(() => {
    if (dots.length > 0 && sequence.length > 0) {
      playSequence();
    }
  }, [dots, sequence, playSequence]);

  const handleDotClick = (dotId: number) => {
    if (isSequencePlaying) return;

    if (dotId === sequence[currentSequenceIndex]) {
      const newIndex = currentSequenceIndex + 1;
      setCurrentSequenceIndex(newIndex);
      
      if (newIndex === sequence.length) {
        // Sequence completed
        const reactionTime = (Date.now() - roundStartTime) / 1000;
        const roundScore = 100 + (sequence.length * 20);
        setScore(prevScore => prevScore + roundScore);
        setReactionTimes(prev => [...prev, reactionTime]);
        setCorrectAnswers(c => c + 1);
        setFeedback(`Perfect! +${roundScore}`);
        
        setTimeout(() => {
          setFeedback("");
          if (round < 10) {
            setRound(prev => prev + 1);
            generateDots();
          } else {
            setGameOver(true);
            setGameEndTime(Date.now());
          }
        }, 1500);
      }
    } else {
      setWrongAnswers(w => w + 1);
      setFeedback("Wrong order! Try again");
      setTimeout(() => {
        setFeedback("");
        setCurrentSequenceIndex(0);
        playSequence();
      }, 1500);
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
              Watch the sequence carefully and tap the dots in the correct order. Focus on the pattern and react quickly!
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}s average time
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Six Dots Results</div>
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
              <span>{round}/10</span>
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
              onClick={() => navigator.share && navigator.share({ title: 'Six Dots Results', text: `Score: ${score}, Accuracy: ${accuracy}%, Avg: ${stats?.average ?? 0}s`, url: window.location.href })}
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
          <div className={`text-sm font-medium ${feedback.includes("Perfect") ? "text-green-400" : "text-red-400"}`}>
            {feedback}
          </div>
        )}
      </div>

      <div className="relative w-80 h-80 bg-luxury-black border-2 border-luxury-white/20 rounded-lg">
        {dots.map((dot) => (
          <button
            key={dot.id}
            onClick={() => handleDotClick(dot.id)}
            disabled={isSequencePlaying}
            className={`absolute w-12 h-12 rounded-full border-2 transition-all duration-300 ${
              targetDot === dot.id
                ? "scale-125 shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                : "hover:scale-110"
            }`}
            style={{
              left: `${dot.x}px`,
              top: `${dot.y}px`,
              backgroundColor: dot.color,
              borderColor: targetDot === dot.id ? "#ffffff" : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>

      <div className="text-center text-xs text-luxury-white/50">
        {isSequencePlaying 
          ? "Watch the sequence carefully..." 
          : `Tap the dots in order (${currentSequenceIndex + 1}/${sequence.length})`}
      </div>
    </div>
  );
};

export default SixDotsGame;
