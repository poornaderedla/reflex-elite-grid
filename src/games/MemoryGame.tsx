
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

const MemoryGame: React.FC<MemoryGameProps> = ({ onFinish }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);

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
      onFinish(score, finalTime);
    }
  }, [matchedPairs, moves, gameStartTime, onFinish]);

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2) return;
    if (cards[cardId].isFlipped || cards[cardId].isMatched) return;

    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));
    setFlippedCards(prev => [...prev, cardId]);
  };

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
