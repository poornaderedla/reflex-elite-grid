
import React, { useState, useEffect, useCallback } from "react";

interface More100GameProps {
  onFinish: (score: number, time: number) => void;
}

const More100Game: React.FC<More100GameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [actualSum, setActualSum] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [showNumbers, setShowNumbers] = useState<boolean>(true);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);

  const generateRound = useCallback(() => {
    const count = 4 + Math.floor(Math.random() * 3); // 4-6 numbers
    const newNumbers: number[] = [];
    
    for (let i = 0; i < count; i++) {
      newNumbers.push(10 + Math.floor(Math.random() * 90)); // Numbers from 10-99
    }
    
    const sum = newNumbers.reduce((acc, num) => acc + num, 0);
    
    setNumbers(newNumbers);
    setActualSum(sum);
    setUserAnswer("");
    setShowNumbers(true);
    setRoundStartTime(Date.now());
    
    // Hide numbers after 3 seconds
    setTimeout(() => {
      setShowNumbers(false);
    }, 3000);
  }, []);

  useEffect(() => {
    setGameStartTime(Date.now());
    generateRound();
  }, [generateRound]);

  const handleSubmit = () => {
    const userSum = parseInt(userAnswer);
    const timeTaken = (Date.now() - roundStartTime) / 1000;
    const difference = Math.abs(userSum - actualSum);
    
    let roundScore = 0;
    if (difference === 0) {
      roundScore = Math.floor(150 + Math.max(0, (8 - timeTaken) * 10)); // Perfect answer
      setFeedback(`Perfect! Sum was ${actualSum} (+${roundScore})`);
    } else if (difference <= 5) {
      roundScore = Math.floor(100 + Math.max(0, (8 - timeTaken) * 5)); // Close answer
      setFeedback(`Close! Sum was ${actualSum} (+${roundScore})`);
    } else if (difference <= 15) {
      roundScore = 50; // Okay answer
      setFeedback(`Okay! Sum was ${actualSum} (+${roundScore})`);
    } else {
      setFeedback(`Wrong! Sum was ${actualSum} (+0)`);
    }
    
    setScore(prevScore => prevScore + roundScore);

    setTimeout(() => {
      setFeedback("");
      if (round < 8) {
        setRound(prev => prev + 1);
        generateRound();
      } else {
        onFinish(score + roundScore, Date.now() - gameStartTime);
      }
    }, 2500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-4">
      <div className="text-center space-y-2">
        <div className="text-lg">Score: {score}</div>
        <div className="text-sm text-luxury-white/70">Round: {round}/8</div>
        {feedback && (
          <div className={`text-sm font-medium ${feedback.includes("Perfect") || feedback.includes("Close") ? "text-green-400" : feedback.includes("Okay") ? "text-yellow-400" : "text-red-400"}`}>
            {feedback}
          </div>
        )}
      </div>

      <div className="w-80 h-80 bg-luxury-black border border-luxury-white/20 rounded-lg flex items-center justify-center">
        {showNumbers ? (
          <div className="text-center space-y-4">
            <div className="text-sm text-luxury-white/70 mb-4">Add these numbers:</div>
            <div className="space-y-3">
              {numbers.map((number, index) => (
                <div key={index} className="text-3xl font-bold text-luxury-gold">
                  {number}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-sm text-luxury-white/70">What was the sum?</div>
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-32 h-12 bg-luxury-black border border-luxury-white/20 rounded-lg text-center text-xl text-luxury-white focus:border-luxury-gold/50 focus:outline-none"
              placeholder="Sum"
            />
            <button
              onClick={handleSubmit}
              disabled={!userAnswer}
              className="block w-full bg-luxury-gold text-luxury-black px-4 py-2 rounded-lg font-medium hover:bg-luxury-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-luxury-white/50">
        {showNumbers ? "Memorize and add all the numbers" : "Enter the sum of all numbers"}
      </div>
    </div>
  );
};

export default More100Game;
