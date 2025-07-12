
import React, { useState, useEffect } from 'react';

interface ShakeGameProps {
  onFinish: (score: number, time: number) => void;
}

const ShakeGame: React.FC<ShakeGameProps> = ({ onFinish }) => {
  const [shakes, setShakes] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [shakeTimes, setShakeTimes] = useState<number[]>([]);
  const [lastShakeTime, setLastShakeTime] = useState<number>(0);
  const gameDuration = 5000; // 5 seconds
  const gameStartTime = React.useRef(0);

  const shakeBenchmarks = {
    worldClass: 20,
    excellent: 15,
    good: 12,
    average: 10,
    slow: 8,
    verySlow: 5
  };

  const calculateStats = () => {
    if (shakeTimes.length === 0) return null;
    
    const average = Math.round((shakeTimes.reduce((a, b) => a + b, 0) / shakeTimes.length) * 100) / 100;
    const best = Math.min(...shakeTimes);
    const worst = Math.max(...shakeTimes);
    const shakesPerSecond = shakes / (gameDuration / 1000);
    
    let performanceRating = 'Very Slow';
    let ratingColor = 'text-red-400';
    
    if (shakes >= shakeBenchmarks.worldClass) {
      performanceRating = 'World Class';
      ratingColor = 'text-purple-400';
    } else if (shakes >= shakeBenchmarks.excellent) {
      performanceRating = 'Excellent';
      ratingColor = 'text-blue-400';
    } else if (shakes >= shakeBenchmarks.good) {
      performanceRating = 'Good';
      ratingColor = 'text-green-400';
    } else if (shakes >= shakeBenchmarks.average) {
      performanceRating = 'Average';
      ratingColor = 'text-yellow-400';
    } else if (shakes >= shakeBenchmarks.slow) {
      performanceRating = 'Slow';
      ratingColor = 'text-orange-400';
    }
    
    return {
      average,
      best,
      worst,
      shakesPerSecond,
      performanceRating,
      ratingColor,
      benchmarks: shakeBenchmarks
    };
  };

  const handleMotion = (event: DeviceMotionEvent) => {
    const acceleration = event.accelerationIncludingGravity;
    if (acceleration && acceleration.x && acceleration.y && acceleration.z) {
      const magnitude = Math.sqrt(acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2);
      // A simple threshold to detect a shake
      if (magnitude > 15) {
        const currentTime = Date.now();
        const timeSinceLastShake = currentTime - lastShakeTime;
        if (timeSinceLastShake > 100) { // Prevent multiple shakes in quick succession
          setShakes(s => s + 1);
          setShakeTimes(prev => [...prev, timeSinceLastShake]);
          setLastShakeTime(currentTime);
        }
      }
    }
  };

  const requestPermission = () => {
    // For iOS 13+
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
            setPermissionGranted(true);
            gameStartTime.current = Date.now();
            setLastShakeTime(Date.now());
          } else {
            setError("Permission denied. Please enable motion sensor access in your browser settings.");
          }
        })
        .catch(console.error);
    } else {
      // For other browsers
      window.addEventListener('devicemotion', handleMotion);
      setPermissionGranted(true);
      gameStartTime.current = Date.now();
      setLastShakeTime(Date.now());
    }
  };

  useEffect(() => {
    if (permissionGranted) {
      const timer = setTimeout(() => {
        setGameOver(true);
        setGameEndTime(Date.now());
        window.removeEventListener('devicemotion', handleMotion);
      }, gameDuration);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('devicemotion', handleMotion);
      };
    }
  }, [permissionGranted]);
  
  if (error) {
     return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!permissionGranted) {
    return (
       <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <p>This game requires access to your device's motion sensors.</p>
        <button onClick={requestPermission} className="btn-primary">
          Grant Permission
        </button>
      </div>
    );
  }

  if (gameOver && gameEndTime) {
    const stats = calculateStats();
    const totalTime = gameEndTime - gameStartTime.current;
    
    return (
      <div className="w-full min-h-[calc(100vh-10rem)] flex items-center justify-center bg-luxury-black p-6">
        <div className="w-full max-w-md bg-luxury-black rounded-2xl shadow-2xl border-2 border-luxury-gold p-6 flex flex-col items-center animate-fade-in">
          {/* Best Results & Tips Section */}
          <div className="w-full mb-4 p-3 rounded-lg bg-luxury-gold/10 border border-luxury-gold/40 text-center">
            <div className="text-base font-semibold text-luxury-gold mb-1">How to Get the Best Results</div>
            <div className="text-sm text-luxury-white/80 mb-1">
              Shake your device as fast and consistently as possible. Maintain a steady rhythm for maximum shakes!
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {shakeBenchmarks.worldClass}+ shakes in 5 seconds
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Shake Results</div>
          </div>
          
          <div className="w-full bg-luxury-black/50 rounded-lg border border-luxury-gold/30 p-4 mb-4">
            <div className="flex justify-between text-lg">
              <span className="text-luxury-white/80">Shakes:</span>
              <span className="font-bold text-luxury-gold">{shakes}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Shakes/Second:</span>
              <span className="font-semibold text-luxury-gold">{stats?.shakesPerSecond.toFixed(1) ?? 0}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Avg. Interval:</span>
              <span>{stats?.average ?? 0}ms</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Best Interval:</span>
              <span>{stats?.best ?? 0}ms</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Worst Interval:</span>
              <span>{stats?.worst ?? 0}ms</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Total Time:</span>
              <span>{(totalTime / 1000).toFixed(2)}s</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Performance:</span>
              <span className={`font-semibold ${stats?.ratingColor ?? 'text-luxury-gold'}`}>{stats?.performanceRating}</span>
            </div>
          </div>
          
          <button
            className="text-xs text-luxury-gold underline mb-2 focus:outline-none"
            onClick={() => setShowDetails((v) => !v)}
          >
            {showDetails ? "Hide Details" : "Show Detailed Stats"}
          </button>
          {showDetails && (
            <div className="w-full bg-luxury-black/80 rounded-lg border border-luxury-gold/30 p-3 mb-2">
              <div className="text-sm text-luxury-gold mb-1 font-semibold">Shake Intervals (ms):</div>
              <div className="flex flex-wrap gap-2 text-xs text-luxury-white/80">
                {shakeTimes.map((t, i) => (
                  <span key={i} className="px-2 py-1 bg-luxury-gold/10 rounded">{t}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-4 mt-4 w-full">
            <button
              className="flex-1 px-4 py-2 bg-luxury-gold text-luxury-black font-semibold rounded hover:bg-yellow-400 transition"
              onClick={() => window.location.reload()}
            >
              Play Again
            </button>
            <button
              className="flex-1 px-4 py-2 bg-luxury-white text-luxury-black font-semibold rounded hover:bg-luxury-gold transition"
              onClick={() => navigator.share && navigator.share({ title: 'Shake Results', text: `Shakes: ${shakes}, Rate: ${stats?.shakesPerSecond.toFixed(1) ?? 0}/s`, url: window.location.href })}
            >
              Share
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-4">
      <div className="text-4xl font-bold text-luxury-gold animate-pulse">Shake!</div>
      <div className="text-lg">Score: {shakes}</div>
      <p className="text-sm text-luxury-white/70">Shake your device as fast as you can!</p>
    </div>
  );
};

export default ShakeGame;
