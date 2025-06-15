
import React, { useState, useEffect, useCallback } from "react";

interface MathGameProps {
  onFinish: (score: number, time: number) => void;
}

const MathGame: React.FC<MathGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [currentEquation, setCurrentEquation] = useState<string>("");
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [rounds, setRounds] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);

  const totalRounds = 15;

  const generateEquation = useCallback(() => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, answer: number;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 25;
        num2 = Math.floor(Math.random() * 25) + 1;
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
      default:
        num1 = 1;
        num2 = 1;
        answer = 2;
    }
    
    setCurrentEquation(`${num1} ${operation} ${num2}`);
    setCorrectAnswer(answer);
  }, []);

  useEffect(() => {
    setGameStartTime(Date.now());
    generateEquation();
  }, [generateEquation]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onFinish(score, Date.now() - gameStartTime);
    }
  }, [timeLeft, score, gameStartTime, onFinish]);

  const handleSubmit = () => {
    const answer = parseInt(userAnswer);
    
    if (answer === correctAnswer) {
      const timeBonus = Math.max(0, timeLeft * 2);
      setScore(prevScore => prevScore + 100 + timeBonus);
    }
    
    setUserAnswer("");
    setRounds(prevRounds => prevRounds + 1);
    
    if (rounds + 1 >= totalRounds) {
      onFinish(score, Date.now() - gameStartTime);
    } else {
      generateEquation();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="text-sm text-luxury-white/70">Time: {timeLeft}s</div>
        <div className="text-lg">Score: {score}</div>
      </div>
      
      <div className="text-center space-y-6">
        <div className="text-4xl font-bold text-luxury-gold">
          {currentEquation} = ?
        </div>
        
        <div className="space-y-4">
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-32 h-12 text-center text-xl bg-luxury-black border border-luxury-white/20 rounded-md text-luxury-white focus:border-luxury-gold focus:outline-none"
            placeholder="?"
            autoFocus
          />
          
          <button
            onClick={handleSubmit}
            disabled={!userAnswer}
            className="btn-primary w-24"
          >
            Submit
          </button>
        </div>
      </div>
      
      <div className="text-sm text-luxury-white/50">
        Question {rounds + 1}/{totalRounds}
      </div>
    </div>
  );
};

export default MathGame;
