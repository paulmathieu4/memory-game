import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const MIN_PAIRS = 2;
const MAX_PAIRS = 12;
const DEFAULT_PAIRS = 8;
const EMOJIS = ['🐶', '🐱', '🦊', '🐻', '🐼', '🐸', '🦁', '🐵', '🐯', '🐨', '🦄', '🐙', '🐰', '🦉', '🐢', '🐞', '🦋', '🐳', '🦓'];

function shuffle(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createShuffledDeck(pairNumbers) {
  const chosen = shuffle(EMOJIS).slice(0, pairNumbers);
  const deck = shuffle([...chosen, ...chosen]).map((emoji, idx) => ({
    id: idx,
    emoji,
    flipped: false,
    matched: false,
  }));
  return deck;
}


export default function App() {
  const [pairNumbers, setPairNumbers] = useState(DEFAULT_PAIRS);
  const [cards, setCards] = useState(createShuffledDeck(DEFAULT_PAIRS));
  const [flippedIndices, setFlippedIndices] = useState([]); // indices of currently flipped cards
  const [isBusy, setIsBusy] = useState(false); // prevent rapid flipping
  const [won, setWon] = useState(false);


  // Reset game when pairNumbers changes
  useEffect(() => {
    resetGame();
  }, [pairNumbers]);

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

  const resetGame = () => {
    setCards(createShuffledDeck(pairNumbers));
    setFlippedIndices([]);
    setIsBusy(false);
    setWon(false);
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Memory Game</Text>
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Number of Pairs:</Text>
        <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginRight: 8 }}>
          <Picker
            selectedValue={pairNumbers}
            style={{ width: 100, height: 60 }}
            onValueChange={(itemValue) => setPairNumbers(itemValue)}
            mode="dropdown"
          >
            {Array.from({ length: MAX_PAIRS - MIN_PAIRS + 1 }, (_, i) => (
              <Picker.Item key={i + MIN_PAIRS} label={(i + MIN_PAIRS).toString()} value={i + MIN_PAIRS} />
            ))}
          </Picker>
        </View>
        <Text style={styles.inputRange}>({MIN_PAIRS}-{MAX_PAIRS})</Text>
      </View>
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
        </View>
      )}
      <Button
        onPress={resetGame}
        title="Reset Game"
        color="#841584"
        accessibilityLabel="Reset Game"
      />
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 18,
    marginRight: 8,
  },

  inputRange: {
    fontSize: 14,
    color: '#888',
  },
  grid: {
    width: 320,
    minHeight: 320,
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
});
