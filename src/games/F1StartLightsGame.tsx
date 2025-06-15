
import React, { useState, useEffect, useCallback } from "react";

interface F1StartLightsGameProps {
  onFinish: (score: number, time: number) => void;
}

const F1StartLightsGame: React.FC<F1StartLightsGameProps> = ({ onFinish }) => {
  const [gameState, setGameState] = useState<"waiting" | "lights" | "go" | "finished">("waiting");
  const [lightsOn, setLightsOn] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");

  const startLightSequence = useCallback(() => {
    setGameState("lights");
    setLightsOn(0);
    
    let currentLights = 0;
    const lightInterval = setInterval(() => {
      currentLights++;
      setLightsOn(currentLights);
      
      if (currentLights === 5) {
        clearInterval(lightInterval);
        // Random delay before lights go out (2-5 seconds)
        const delay = 2000 + Math.random() * 3000;
        setTimeout(() => {
          setGameState("go");
          setStartTime(Date.now());
        }, delay);
      }
    }, 1000);
  }, []);

  useEffect(() => {
    if (gameState === "waiting") {
      setGameStartTime(Date.now());
      setTimeout(startLightSequence, 1000);
    }
  }, [gameState, startLightSequence]);

  const handleReaction = () => {
    if (gameState === "go") {
      const reactionMs = Date.now() - startTime;
      setReactionTime(reactionMs);
      
      const roundScore = Math.max(1000 - reactionMs, 100);
      setTotalScore(prev => prev + roundScore);
      setFeedback(`${reactionMs}ms (+${roundScore})`);
      
      setTimeout(() => {
        if (round < 5) {
          setRound(prev => prev + 1);
          setGameState("waiting");
          setFeedback("");
        } else {
          onFinish(totalScore + roundScore, Date.now() - gameStartTime);
        }
      }, 1500);
    } else if (gameState === "lights") {
      // False start
      setFeedback("False Start! Wait for lights out!");
      setTimeout(() => {
        setGameState("waiting");
        setFeedback("");
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="text-lg">Round: {round}/5</div>
        <div className="text-sm text-luxury-white/70">Score: {totalScore}</div>
        {feedback && (
          <div className={`text-sm font-medium ${feedback.includes("False") ? "text-red-400" : "text-green-400"}`}>
            {feedback}
          </div>
        )}
      </div>

      {/* F1 Start Lights */}
      <div className="flex gap-4 mb-8">
        {[1, 2, 3, 4, 5].map((light) => (
          <div
            key={light}
            className={`w-8 h-12 rounded-md border-2 transition-all duration-300 ${
              lightsOn >= light && gameState === "lights"
                ? "bg-red-500 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.6)]"
                : "bg-luxury-black border-luxury-white/20"
            }`}
          />
        ))}
      </div>

      {/* Action Area */}
      <div className="w-80 h-80 flex items-center justify-center">
        <button
          onClick={handleReaction}
          className={`w-full h-full rounded-lg border-2 text-xl font-bold transition-all ${
            gameState === "go"
              ? "bg-green-500 border-green-400 text-white hover:bg-green-600"
              : gameState === "lights"
              ? "bg-red-500/20 border-red-400 text-red-400"
              : "bg-luxury-black border-luxury-white/20 text-luxury-white/50"
          }`}
          disabled={gameState === "waiting"}
        >
          {gameState === "waiting" && "Get Ready..."}
          {gameState === "lights" && "WAIT..."}
          {gameState === "go" && "GO!"}
        </button>
      </div>

      <div className="text-center text-xs text-luxury-white/50">
        Wait for all lights to go out, then tap GO as fast as possible
      </div>
    </div>
  );
};

export default F1StartLightsGame;
