
import React, { useState, useEffect } from 'react';

interface ShakeGameProps {
  onFinish: (score: number, time: number) => void;
}

const ShakeGame: React.FC<ShakeGameProps> = ({ onFinish }) => {
  const [shakes, setShakes] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const gameDuration = 5000; // 5 seconds
  const gameStartTime = React.useRef(0);

  const handleMotion = (event: DeviceMotionEvent) => {
    const acceleration = event.accelerationIncludingGravity;
    if (acceleration && acceleration.x && acceleration.y && acceleration.z) {
      const magnitude = Math.sqrt(acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2);
      // A simple threshold to detect a shake
      if (magnitude > 15) {
        setShakes(s => s + 1);
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
    }
  };

  useEffect(() => {
    if (permissionGranted) {
      const timer = setTimeout(() => {
        onFinish(shakes, gameDuration);
      }, gameDuration);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('devicemotion', handleMotion);
      };
    }
  }, [permissionGranted, onFinish, shakes]);
  
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 space-y-4">
      <div className="text-4xl font-bold text-luxury-gold animate-pulse">Shake!</div>
      <div className="text-lg">Score: {shakes}</div>
      <p className="text-sm text-luxury-white/70">Shake your device as fast as you can!</p>
    </div>
  );
};

export default ShakeGame;
