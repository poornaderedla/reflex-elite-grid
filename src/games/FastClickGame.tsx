
import React, { useState, useEffect, useCallback } from "react";

interface FastClickGameProps {
  onFinish: (score: number, time: number) => void;
}

const BUTTON_COLORS = ['red', 'blue', 'green', 'yellow'];

const FastClickGame: React.FC<FastClickGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [targetColor, setTargetColor] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(3);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");
  const [roundStartTime, setRoundStartTime] = useState<number>(0);

  const getColorClasses = (color: string, isTarget: boolean = false) => {
    const baseClasses = "w-32 h-32 rounded-lg font-bold text-white transition-all active:scale-95";
    switch (color) {
      case 'red':
        return `${baseClasses} ${isTarget ? 'bg-red-500 hover:bg-red-600' : 'bg-red-500/30'}`;
      case 'blue':
        return `${baseClasses} ${isTarget ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-500/30'}`;
      case 'green':
        return `${baseClasses} ${isTarget ? 'bg-green-500 hover:bg-green-600' : 'bg-green-500/30'}`;
      case 'yellow':
        return `${baseClasses} ${isTarget ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-yellow-500/30'}`;
      default:
        return baseClasses;
    }
  };

  const startRound = useCallback(() => {
    const newTarget = BUTTON_COLORS[Math.floor(Math.random() * BUTTON_COLORS.length)];
    setTargetColor(newTarget);
    setTimeLeft(3);
    setIsActive(true);
    setRoundStartTime(Date.now());
  }, []);

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
    } else if (timeLeft === 0 && isActive) {
      // Time's up
      setIsActive(false);
      setFeedback("Too slow!");
      setTimeout(() => {
        nextRound();
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isActive]);

  const handleButtonClick = (clickedColor: string) => {
    if (!isActive) return;
    
    setIsActive(false);
    const reactionTime = Date.now() - roundStartTime;
    
    if (clickedColor === targetColor) {
      const roundScore = Math.floor(200 - reactionTime / 10); // Max 200 points, decreases with time
      setScore(prevScore => prevScore + Math.max(roundScore, 10));
      setFeedback(`Correct! +${Math.max(roundScore, 10)} (${reactionTime}ms)`);
    } else {
      setFeedback("Wrong button!");
    }
    
    setTimeout(() => {
      nextRound();
    }, 1500);
  };

  const nextRound = () => {
    setFeedback("");
    if (round < 10) {
      setRound(prev => prev + 1);
      startRound();
    } else {
      onFinish(score, Date.now() - gameStartTime);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-6">
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
        <div className="text-2xl font-bold text-luxury-gold">{timeLeft}s</div>
        <div className="text-lg text-luxury-white">
          Click the <span className="font-bold text-luxury-gold">{targetColor}</span> button!
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {BUTTON_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => handleButtonClick(color)}
            disabled={!isActive}
            className={getColorClasses(color, isActive)}
          >
            {color.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="text-center text-xs text-luxury-white/50">
        Click the correct colored button as fast as possible
      </div>
    </div>
  );
};

export default FastClickGame;
