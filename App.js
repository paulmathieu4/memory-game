import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const EMOJIS = ['🐶', '🐱', '🦊', '🐻', '🐼', '🐸', '🦁', '🐵'];

function shuffle(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createShuffledDeck() {
  const deck = shuffle([...EMOJIS, ...EMOJIS]).map((emoji, idx) => ({
    id: idx,
    emoji,
    flipped: false,
    matched: false,
  }));
  return deck;
}

export default function App() {
  const [cards, setCards] = useState(createShuffledDeck());
  const [flippedIndices, setFlippedIndices] = useState([]); // indices of currently flipped cards
  const [isBusy, setIsBusy] = useState(false); // prevent rapid flipping
  const [won, setWon] = useState(false);

  useEffect(() => {
    if (flippedIndices.length === 2) {
      setIsBusy(true);
      const [firstIdx, secondIdx] = flippedIndices;
      if (cards[firstIdx].emoji === cards[secondIdx].emoji) {
        // Match found
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, i) =>
              i === firstIdx || i === secondIdx
                ? { ...card, matched: true }
                : card
            )
          );
          setFlippedIndices([]);
          setIsBusy(false);
        }, 700);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, i) =>
              i === firstIdx || i === secondIdx
                ? { ...card, flipped: false }
                : card
            )
          );
          setFlippedIndices([]);
          setIsBusy(false);
        }, 1000);
      }
    }
  }, [flippedIndices, cards]);

  useEffect(() => {
    if (cards.every((card) => card.matched)) {
      setWon(true);
    }
  }, [cards]);

  const handleCardPress = (index) => {
    if (isBusy || cards[index].flipped || cards[index].matched || flippedIndices.length === 2) return;
    setCards((prev) =>
      prev.map((card, i) =>
        i === index ? { ...card, flipped: true } : card
      )
    );
    setFlippedIndices((prev) => [...prev, index]);
  };

  const handleReset = () => {
    setCards(createShuffledDeck());
    setFlippedIndices([]);
    setIsBusy(false);
    setWon(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Memory Game</Text>
      <View style={styles.grid}>
        {cards.map((card, idx) => (
          <TouchableOpacity
            key={card.id}
            style={[styles.card, card.matched && styles.cardMatched]}
            onPress={() => handleCardPress(idx)}
            activeOpacity={card.flipped || card.matched ? 1 : 0.7}
            disabled={card.flipped || card.matched || isBusy || flippedIndices.length === 2}
          >
            <Text style={styles.cardText}>
              {card.flipped || card.matched ? card.emoji : '❓'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {won && (
        <View style={styles.winContainer}>
          <Text style={styles.winText}>🎉 You won! 🎉</Text>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  grid: {
    width: 320,
    height: 320,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    width: 70,
    height: 70,
    margin: 5,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 4,
  },
  cardText: {
    fontSize: 36,
  },
  cardMatched: {
    backgroundColor: '#b2fab4',
  },
  winContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  winText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#388e3c',
  },
  resetButton: {
    backgroundColor: '#388e3c',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
