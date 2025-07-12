
import React, { useState, useEffect, useCallback } from "react";

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  onFinish: (score: number, time: number) => void;
}

const reactionTimeBenchmarks = {
  worldClass: 230,
  excellent: 260,
  good: 300,
  average: 350,
  slow: 400,
  verySlow: 500
};

const MemoryGame: React.FC<MemoryGameProps> = ({ onFinish }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [lastMoveTime, setLastMoveTime] = useState<number>(0);

  const symbols = ["🔴", "🔵", "🟢", "🟡", "🟣", "🟠", "⚫", "⚪"];

  const initializeGame = useCallback(() => {
    const gameSymbols = symbols.slice(0, 8);
    const cardPairs = [...gameSymbols, ...gameSymbols];
    
    // Shuffle cards
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }

    const initialCards: Card[] = cardPairs.map((symbol, index) => ({
      id: index,
      symbol,
      isFlipped: false,
      isMatched: false,
    }));

    setCards(initialCards);
    setGameStartTime(Date.now());
    setLastMoveTime(Date.now());
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards[first];
      const secondCard = cards[second];

      if (firstCard.symbol === secondCard.symbol) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isMatched: true }
              : card
          ));
          setMatchedPairs(prev => prev + 1);
          setFlippedCards([]);
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    if (matchedPairs === 8) {
      const finalTime = Date.now() - gameStartTime;
      const score = Math.max(1000 - moves * 10 - Math.floor(finalTime / 100), 100);
      setGameOver(true);
      setGameEndTime(Date.now());
    }
  }, [matchedPairs, moves, gameStartTime]);

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2) return;
    if (cards[cardId].isFlipped || cards[cardId].isMatched) return;

    // Record reaction time for each move
    const now = Date.now();
    if (lastMoveTime > 0) {
      const moveTime = now - lastMoveTime;
      setReactionTimes(prev => [...prev, moveTime]);
    }
    setLastMoveTime(now);

    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));
    setFlippedCards(prev => [...prev, cardId]);
  };

  // Calculate stats
  const calculateStats = () => {
    if (reactionTimes.length === 0) return null;
    const sum = reactionTimes.reduce((a, b) => a + b, 0);
    const average = Math.round(sum / reactionTimes.length);
    const best = Math.min(...reactionTimes);
    const worst = Math.max(...reactionTimes);
    const vsWorldClass = average - reactionTimeBenchmarks.worldClass;
    const percentageSlower = Math.round((vsWorldClass / reactionTimeBenchmarks.worldClass) * 100);
    let performanceRating = "";
    if (average <= reactionTimeBenchmarks.worldClass) {
      performanceRating = "World Class";
    } else if (average <= reactionTimeBenchmarks.excellent) {
      performanceRating = "Excellent";
    } else if (average <= reactionTimeBenchmarks.good) {
      performanceRating = "Good";
    } else if (average <= reactionTimeBenchmarks.average) {
      performanceRating = "Average";
    } else if (average <= reactionTimeBenchmarks.slow) {
      performanceRating = "Slow";
    } else {
      performanceRating = "Very Slow";
    }
    return {
      average,
      best,
      worst,
      vsWorldClass,
      percentageSlower,
      performanceRating,
      benchmarks: reactionTimeBenchmarks
    };
  };

  if (gameOver) {
    const totalTimeMs = gameEndTime && gameStartTime ? gameEndTime - gameStartTime : 0;
    const finalScore = Math.max(1000 - moves * 10 - Math.floor(totalTimeMs / 100), 100);
    const stats = calculateStats();
    return (
      <div className="w-full min-h-[calc(100vh-10rem)] flex items-center justify-center bg-luxury-black p-6">
        <div className="w-full max-w-md bg-luxury-black rounded-2xl shadow-2xl border-2 border-luxury-gold p-6 flex flex-col items-center animate-fade-in">
          {/* Best Results & Tips Section */}
          <div className="w-full mb-4 p-3 rounded-lg bg-luxury-gold/10 border border-luxury-gold/40 text-center">
            <div className="text-base font-semibold text-luxury-gold mb-1">How to Get the Best Results</div>
            <div className="text-sm text-luxury-white/80 mb-1">
              Find and match identical pairs as quickly as possible. Fewer moves and faster time = higher score!
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}ms average reaction
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Memory Results</div>
          </div>
          <div className="w-full flex flex-col gap-2 mb-4">
            <div className="flex justify-between text-lg">
              <span className="text-luxury-white/80">Final Score:</span>
              <span className="font-bold text-luxury-gold">{finalScore}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Total Moves:</span>
              <span>{moves}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Pairs Found:</span>
              <span>{matchedPairs}/8</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Avg. Move Time:</span>
              <span>{stats?.average ?? 0}ms</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Best:</span>
              <span>{stats?.best ?? 0}ms</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Worst:</span>
              <span>{stats?.worst ?? 0}ms</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Total Time:</span>
              <span>{(totalTimeMs / 1000).toFixed(2)}s</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Performance:</span>
              <span className="font-semibold text-luxury-gold">{stats?.performanceRating}</span>
            </div>
          </div>
          <button
            className="text-xs text-luxury-gold underline mb-2 focus:outline-none"
            onClick={() => setShowDetails((v) => !v)}
          >
            {showDetails ? "Hide Details" : "Show Detailed Stats"}
          </button>
          {showDetails && (
            <div className="w-full bg-luxury-black/80 rounded-lg border border-luxury-gold/30 p-3 mb-2 max-h-48 overflow-y-auto animate-fade-in">
              <div className="text-sm text-luxury-gold mb-1 font-semibold">Move Times (ms):</div>
              <div className="flex flex-wrap gap-2 text-xs text-luxury-white/80">
                {reactionTimes.map((t, i) => (
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
              onClick={() => navigator.share && navigator.share({ title: 'Memory Results', text: `Score: ${finalScore}, Moves: ${moves}, Time: ${(totalTimeMs / 1000).toFixed(2)}s`, url: window.location.href })}
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
      <div className="text-center space-y-2">
        <div className="text-lg">Moves: {moves}</div>
        <div className="text-sm text-luxury-white/70">
          Pairs: {matchedPairs}/8
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 w-80 h-80">
        {cards.map((card) => (
          <button
            key={card.id}
            className={`
              w-full h-full rounded-lg border-2 flex items-center justify-center text-2xl
              transition-all duration-300 transform
              ${card.isFlipped || card.isMatched 
                ? 'bg-luxury-white text-luxury-black border-luxury-gold' 
                : 'bg-luxury-black border-luxury-white/20 hover:border-luxury-gold/50'
              }
              ${!card.isFlipped && !card.isMatched ? 'hover:scale-105' : ''}
              ${card.isMatched ? 'opacity-60' : ''}
            `}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isFlipped || card.isMatched}
          >
            {card.isFlipped || card.isMatched ? card.symbol : '?'}
          </button>
        ))}
      </div>
      
      <div className="text-center text-xs text-luxury-white/50">
        Find and match identical pairs
      </div>
    </div>
  );
};

export default MemoryGame;
