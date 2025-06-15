
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

  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

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
        const roundScore = 100 + (sequence.length * 20);
        setScore(prevScore => prevScore + roundScore);
        setFeedback(`Perfect! +${roundScore}`);
        
        setTimeout(() => {
          setFeedback("");
          if (round < 10) {
            setRound(prev => prev + 1);
            generateDots();
          } else {
            onFinish(score + roundScore, Date.now() - gameStartTime);
          }
        }, 1500);
      }
    } else {
      setFeedback("Wrong order! Try again");
      setTimeout(() => {
        setFeedback("");
        setCurrentSequenceIndex(0);
        playSequence();
      }, 1500);
    }
  };

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
