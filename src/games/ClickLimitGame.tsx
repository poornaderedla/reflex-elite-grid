
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

  const startRound = useCallback(() => {
    const newTarget = 15 + round * 5; // Increasing difficulty
    setTargetClicks(newTarget);
    setClickCount(0);
    setTimeLeft(10);
    setIsActive(true);
    setRoundStartTime(Date.now());
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
      setFeedback(`Success! +${roundScore} points`);
    } else {
      setFeedback(`Failed! Only ${clickCount}/${targetClicks} clicks`);
    }

    setTimeout(() => {
      setFeedback("");
      if (round < 5) {
        setRound(prev => prev + 1);
        startRound();
      } else {
        onFinish(score, Date.now() - gameStartTime);
      }
    }, 2000);
  };

  const handleClick = () => {
    if (isActive) {
      setClickCount(prev => prev + 1);
      if (clickCount + 1 >= targetClicks) {
        endRound();
      }
    }
  };

  const progressPercentage = (clickCount / targetClicks) * 100;

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
