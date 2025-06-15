
import React, { useState, useEffect, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface SoundGameProps {
  onFinish: (score: number, time: number) => void;
}

const SoundGame: React.FC<SoundGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [soundPlayed, setSoundPlayed] = useState<boolean>(false);
  const [rounds, setRounds] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [soundTime, setSoundTime] = useState<number>(0);

  const totalRounds = 8;

  const playSound = useCallback(() => {
    // Visual sound indication since we can't play actual audio
    setSoundPlayed(true);
    setSoundTime(Date.now());
    
    // Auto-advance if no tap within 2 seconds
    setTimeout(() => {
      if (soundPlayed) {
        nextRound();
      }
    }, 2000);
  }, [soundPlayed]);

  const nextRound = useCallback(() => {
    setIsListening(false);
    setSoundPlayed(false);
    setRounds(prevRounds => {
      const newRounds = prevRounds + 1;
      if (newRounds >= totalRounds) {
        onFinish(score, Date.now() - gameStartTime);
        return prevRounds;
      } else {
        // Start next round after delay
        setTimeout(() => {
          const delay = Math.random() * 3000 + 2000; // 2-5 seconds
          setCountdown(Math.ceil(delay / 1000));
          setIsListening(true);
          
          setTimeout(playSound, delay);
        }, 1000);
        return newRounds;
      }
    });
  }, [score, gameStartTime, onFinish, playSound]);

  useEffect(() => {
    setGameStartTime(Date.now());
    // Start first round
    const delay = Math.random() * 3000 + 2000;
    setCountdown(Math.ceil(delay / 1000));
    setIsListening(true);
    setTimeout(playSound, delay);
  }, [playSound]);

  useEffect(() => {
    if (isListening && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isListening, countdown]);

  const handleTap = () => {
    if (!isListening) return;
    
    if (soundPlayed && soundTime) {
      // Correct tap
      const reaction = Date.now() - soundTime;
      setReactionTime(reaction);
      const points = Math.max(0, Math.floor(1000 - reaction));
      setScore(prevScore => prevScore + points);
      nextRound();
    } else {
      // Early tap - penalty
      setScore(prevScore => Math.max(0, prevScore - 100));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-8">
      <div className="text-center space-y-2">
        <div className="text-lg">Score: {score}</div>
        <div className="text-sm text-luxury-white/70">
          Round {rounds + 1}/{totalRounds}
        </div>
      </div>
      
      <div 
        className={`relative w-64 h-64 rounded-full border-4 transition-all duration-300 cursor-pointer ${
          soundPlayed 
            ? 'border-luxury-gold bg-luxury-gold/20 animate-pulse' 
            : isListening 
              ? 'border-luxury-white/30 bg-luxury-white/5' 
              : 'border-luxury-white/10 bg-luxury-black'
        }`}
        onClick={handleTap}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {soundPlayed ? (
            <>
              <Volume2 className="h-16 w-16 text-luxury-gold mb-2" />
              <div className="text-luxury-gold font-bold">TAP NOW!</div>
            </>
          ) : isListening ? (
            <>
              <VolumeX className="h-16 w-16 text-luxury-white/50 mb-2" />
              <div className="text-luxury-white/70">Listen...</div>
              {countdown > 0 && (
                <div className="text-sm mt-2">{countdown}</div>
              )}
            </>
          ) : (
            <>
              <VolumeX className="h-16 w-16 text-luxury-white/30 mb-2" />
              <div className="text-luxury-white/50">Get Ready</div>
            </>
          )}
        </div>
      </div>
      
      <div className="text-center text-sm text-luxury-white/50">
        Tap when you see the sound indicator
      </div>
      
      {reactionTime > 0 && (
        <div className="text-luxury-gold text-sm">
          Last reaction: {reactionTime}ms
        </div>
      )}
    </div>
  );
};

export default SoundGame;
