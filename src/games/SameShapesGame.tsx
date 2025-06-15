
import React, { useState, useEffect, useCallback } from "react";

interface SameShapesGameProps {
  onFinish: (score: number, time: number) => void;
}

const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star'];

const SameShapesGame: React.FC<SameShapesGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [shapes, setShapes] = useState<string[]>([]);
  const [targetShape, setTargetShape] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [selectedShapes, setSelectedShapes] = useState<number[]>([]);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);

  const generateRound = useCallback(() => {
    const target = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const gridShapes: string[] = [];
    
    // Add target shape 2-4 times
    const targetCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < targetCount; i++) {
      gridShapes.push(target);
    }
    
    // Fill remaining slots with different shapes
    while (gridShapes.length < 12) {
      const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      gridShapes.push(randomShape);
    }
    
    // Shuffle array
    for (let i = gridShapes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gridShapes[i], gridShapes[j]] = [gridShapes[j], gridShapes[i]];
    }
    
    setShapes(gridShapes);
    setTargetShape(target);
    setSelectedShapes([]);
    setRoundStartTime(Date.now());
  }, []);

  useEffect(() => {
    setGameStartTime(Date.now());
    generateRound();
  }, [generateRound]);

  const renderShape = (shape: string, size: string = "w-8 h-8") => {
    const baseClasses = `${size} flex items-center justify-center`;
    
    switch (shape) {
      case 'circle':
        return <div className={`${baseClasses} bg-luxury-gold rounded-full`} />;
      case 'square':
        return <div className={`${baseClasses} bg-luxury-gold`} />;
      case 'triangle':
        return <div className={`${baseClasses}`}>
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-6 border-l-transparent border-r-transparent border-b-luxury-gold" />
        </div>;
      case 'diamond':
        return <div className={`${baseClasses}`}>
          <div className="w-6 h-6 bg-luxury-gold transform rotate-45" />
        </div>;
      case 'star':
        return <div className={`${baseClasses} text-luxury-gold text-lg`}>★</div>;
      default:
        return <div className={`${baseClasses} bg-luxury-gold`} />;
    }
  };

  const handleShapeClick = (index: number) => {
    if (shapes[index] === targetShape) {
      setSelectedShapes(prev => [...prev, index]);
      
      // Check if all target shapes are found
      const totalTargetShapes = shapes.filter(shape => shape === targetShape).length;
      if (selectedShapes.length + 1 === totalTargetShapes) {
        const timeTaken = (Date.now() - roundStartTime) / 1000;
        const roundScore = Math.floor(100 + Math.max(0, (4 - timeTaken) * 15));
        setScore(prevScore => prevScore + roundScore);
        setFeedback(`All found! +${roundScore}`);
        
        setTimeout(() => {
          setFeedback("");
          if (round < 8) {
            setRound(prev => prev + 1);
            generateRound();
          } else {
            onFinish(score + roundScore, Date.now() - gameStartTime);
          }
        }, 1500);
      }
    } else {
      setFeedback("Wrong shape!");
      setTimeout(() => setFeedback(""), 1000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-4">
      <div className="text-center space-y-2">
        <div className="text-lg">Score: {score}</div>
        <div className="text-sm text-luxury-white/70">Round: {round}/8</div>
        {feedback && (
          <div className={`text-sm font-medium ${feedback.includes("found") ? "text-green-400" : "text-red-400"}`}>
            {feedback}
          </div>
        )}
      </div>

      <div className="text-center space-y-2">
        <div className="text-sm text-luxury-white/70">Find all shapes like this:</div>
        <div className="flex justify-center">
          {renderShape(targetShape, "w-12 h-12")}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 w-80">
        {shapes.map((shape, index) => (
          <button
            key={index}
            onClick={() => handleShapeClick(index)}
            className={`w-16 h-16 border-2 rounded-lg transition-all ${
              selectedShapes.includes(index)
                ? "border-green-400 bg-green-400/20"
                : "border-luxury-white/20 hover:border-luxury-gold/50"
            }`}
            disabled={selectedShapes.includes(index)}
          >
            {renderShape(shape)}
          </button>
        ))}
      </div>

      <div className="text-center text-xs text-luxury-white/50">
        Tap all shapes that match the target shape
      </div>
    </div>
  );
};

export default SameShapesGame;
