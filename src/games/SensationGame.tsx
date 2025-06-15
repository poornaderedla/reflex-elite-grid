
import React, { useState, useEffect, useCallback } from "react";
import { Zap, Circle } from "lucide-react";

interface SensationGameProps {
  onFinish: (score: number, time: number) => void;
}

const SensationGame: React.FC<SensationGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [activeZone, setActiveZone] = useState<number | null>(null);
  const [rounds, setRounds] = useState<number>(0);
  const [isWaiting, setIsWaiting] = useState<boolean>(true);
  const [triggerTime, setTriggerTime] = useState<number>(0);

  const totalRounds = 10;
  const zones = Array.from({ length: 9 }, (_, i) => i); // 3x3 grid

  const triggerSensation = useCallback(() => {
    const randomZone = Math.floor(Math.random() * zones.length);
    setActiveZone(randomZone);
    setTriggerTime(Date.now());
    setIsWaiting(false);
    
    // Auto-advance if no response within 2 seconds
    setTimeout(() => {
      if (activeZone !== null) {
        nextRound();
      }
    }, 2000);
  }, [activeZone]);

  const nextRound = useCallback(() => {
    setActiveZone(null);
    setIsWaiting(true);
    setRounds(prevRounds => {
      const newRounds = prevRounds + 1;
      if (newRounds >= totalRounds) {
        onFinish(score, Date.now() - gameStartTime);
        return prevRounds;
      } else {
        // Start next sensation after delay
        setTimeout(() => {
          const delay = Math.random() * 2000 + 1000; // 1-3 seconds
          setTimeout(triggerSensation, delay);
        }, 500);
        return newRounds;
      }
    });
  }, [score, gameStartTime, onFinish, triggerSensation]);

  useEffect(() => {
    setGameStartTime(Date.now());
    // Start first sensation
    const delay = Math.random() * 2000 + 1000;
    setTimeout(triggerSensation, delay);
  }, [triggerSensation]);

  const handleZoneTouch = (zoneIndex: number) => {
    if (isWaiting || activeZone === null) return;
    
    if (zoneIndex === activeZone) {
      // Correct zone
      const reactionTime = Date.now() - triggerTime;
      const points = Math.max(0, Math.floor(1000 - reactionTime / 2));
      setScore(prevScore => prevScore + points);
      nextRound();
    } else {
      // Wrong zone - penalty
      setScore(prevScore => Math.max(0, prevScore - 50));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="text-lg">Score: {score}</div>
        <div className="text-sm text-luxury-white/70">
          Round {rounds + 1}/{totalRounds}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 w-72 h-72">
        {zones.map((zone) => (
          <div
            key={zone}
            className={`relative border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              activeZone === zone
                ? 'border-luxury-gold bg-luxury-gold/30 animate-pulse'
                : 'border-luxury-white/20 bg-luxury-white/5 hover:border-luxury-white/40'
            }`}
            onClick={() => handleZoneTouch(zone)}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {activeZone === zone ? (
                <Zap className="h-8 w-8 text-luxury-gold" />
              ) : (
                <Circle className="h-6 w-6 text-luxury-white/30" />
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center space-y-2">
        <div className="text-sm text-luxury-white/70">
          {isWaiting ? "Wait for the sensation..." : "Touch the active zone!"}
        </div>
        <div className="text-xs text-luxury-white/50">
          React to visual tactile triggers
        </div>
      </div>
    </div>
  );
};

export default SensationGame;
