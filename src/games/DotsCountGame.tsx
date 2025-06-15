
import React, { useState, useEffect, useCallback } from "react";

interface DotsCountGameProps {
  onFinish: (score: number, time: number) => void;
}

const DotsCountGame: React.FC<DotsCountGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [dots, setDots] = useState<{x: number, y: number}[]>([]);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [showDots, setShowDots] = useState<boolean>(true);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);

  const generateRound = useCallback(() => {
    const count = 5 + Math.floor(Math.random() * 20); // 5-24 dots
    const newDots: {x: number, y: number}[] = [];
    
    for (let i = 0; i < count; i++) {
      newDots.push({
        x: 10 + Math.random() * 80, // 10-90% positioning
        y: 10 + Math.random() * 80,
      });
    }
    
    setDots(newDots);
    setCorrectCount(count);
    setShowDots(true);
    setUserAnswer("");
    setRoundStartTime(Date.now());
    
    // Hide dots after 2 seconds
    setTimeout(() => {
      setShowDots(false);
    }, 2000);
  }, []);

  useEffect(() => {
    setGameStartTime(Date.now());
    generateRound();
  }, [generateRound]);

  const handleSubmit = () => {
    const userCount = parseInt(userAnswer);
    const timeTaken = (Date.now() - roundStartTime) / 1000;
    
    if (userCount === correctCount) {
      const roundScore = Math.floor(100 + Math.max(0, (5 - timeTaken) * 10));
      setScore(prevScore => prevScore + roundScore);
      setFeedback(`Correct! ${correctCount} dots (+${roundScore})`);
    } else {
      setFeedback(`Wrong! It was ${correctCount} dots`);
    }

    setTimeout(() => {
      setFeedback("");
      if (round < 8) {
        setRound(prev => prev + 1);
        generateRound();
      } else {
        onFinish(score + (userCount === correctCount ? Math.floor(100 + Math.max(0, (5 - timeTaken) * 10)) : 0), Date.now() - gameStartTime);
      }
    }, 2000);
  };

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

      <div className="relative w-80 h-80 bg-luxury-black border border-luxury-white/20 rounded-lg overflow-hidden">
        {showDots && dots.map((dot, index) => (
          <div
            key={index}
            className="absolute w-3 h-3 bg-luxury-gold rounded-full"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
        
        {!showDots && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-sm text-luxury-white/70">How many dots did you see?</div>
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-20 h-12 bg-luxury-black border border-luxury-white/20 rounded-lg text-center text-xl text-luxury-white focus:border-luxury-gold/50 focus:outline-none"
                min="0"
                max="50"
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
        {showDots ? "Count the dots quickly!" : "Enter the number of dots you saw"}
      </div>
    </div>
  );
};

export default DotsCountGame;
