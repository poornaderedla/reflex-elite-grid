
import React, { useState, useEffect, useCallback } from "react";

interface ColorFramesCountGameProps {
  onFinish: (score: number, time: number) => void;
}

const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

const ColorFramesCountGame: React.FC<ColorFramesCountGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [frames, setFrames] = useState<string[]>([]);
  const [targetColor, setTargetColor] = useState<string>("");
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [showFrames, setShowFrames] = useState<boolean>(true);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-500';
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'purple': return 'bg-purple-500';
      case 'orange': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const generateRound = useCallback(() => {
    const target = COLORS[Math.floor(Math.random() * COLORS.length)];
    const gridFrames: string[] = [];
    
    // Add target color frames
    const targetCount = 3 + Math.floor(Math.random() * 6); // 3-8 target frames
    for (let i = 0; i < targetCount; i++) {
      gridFrames.push(target);
    }
    
    // Fill remaining slots with other colors
    while (gridFrames.length < 20) {
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      gridFrames.push(randomColor);
    }
    
    // Shuffle array
    for (let i = gridFrames.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gridFrames[i], gridFrames[j]] = [gridFrames[j], gridFrames[i]];
    }
    
    setFrames(gridFrames);
    setTargetColor(target);
    setCorrectCount(targetCount);
    setUserAnswer("");
    setShowFrames(true);
    setRoundStartTime(Date.now());
    
    // Hide frames after 3 seconds
    setTimeout(() => {
      setShowFrames(false);
    }, 3000);
  }, []);

  useEffect(() => {
    setGameStartTime(Date.now());
    generateRound();
  }, [generateRound]);

  const handleSubmit = () => {
    const userCount = parseInt(userAnswer);
    const timeTaken = (Date.now() - roundStartTime) / 1000;
    
    if (userCount === correctCount) {
      const roundScore = Math.floor(100 + Math.max(0, (6 - timeTaken) * 10));
      setScore(prevScore => prevScore + roundScore);
      setFeedback(`Correct! ${correctCount} ${targetColor} frames (+${roundScore})`);
    } else {
      setFeedback(`Wrong! It was ${correctCount} ${targetColor} frames`);
    }

    setTimeout(() => {
      setFeedback("");
      if (round < 7) {
        setRound(prev => prev + 1);
        generateRound();
      } else {
        onFinish(score + (userCount === correctCount ? Math.floor(100 + Math.max(0, (6 - timeTaken) * 10)) : 0), Date.now() - gameStartTime);
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-4">
      <div className="text-center space-y-2">
        <div className="text-lg">Score: {score}</div>
        <div className="text-sm text-luxury-white/70">Round: {round}/7</div>
        {feedback && (
          <div className={`text-sm font-medium ${feedback.includes("Correct") ? "text-green-400" : "text-red-400"}`}>
            {feedback}
          </div>
        )}
      </div>

      {showFrames && (
        <div className="text-center space-y-2">
          <div className="text-sm text-luxury-white/70">Count the {targetColor} frames:</div>
          <div className={`w-6 h-6 ${getColorClass(targetColor)} mx-auto rounded border-2 border-luxury-white`} />
        </div>
      )}

      <div className="w-80 h-80 bg-luxury-black border border-luxury-white/20 rounded-lg p-2">
        {showFrames ? (
          <div className="grid grid-cols-5 gap-1 h-full">
            {frames.map((color, index) => (
              <div
                key={index}
                className={`${getColorClass(color)} rounded border border-luxury-white/30`}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="text-sm text-luxury-white/70">How many {targetColor} frames did you see?</div>
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-20 h-12 bg-luxury-black border border-luxury-white/20 rounded-lg text-center text-xl text-luxury-white focus:border-luxury-gold/50 focus:outline-none"
                min="0"
                max="20"
              />
              <button
                onClick={handleSubmit}
                disabled={!userAnswer}
                className="block w-full bg-luxury-gold text-luxury-black px-4 py-2 rounded-lg font-medium hover:bg-luxury-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-luxury-white/50">
        {showFrames ? `Count the ${targetColor} colored frames` : "Enter your count"}
      </div>
    </div>
  );
};

export default ColorFramesCountGame;
