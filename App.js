import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Button, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

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

function createShuffledDeck(pairNumbers, images) {
  let chosen;
  if (images && images.length >= pairNumbers) {
    chosen = images.slice(0, pairNumbers).map((img, idx) => ({ type: 'image', src: img.uri, id: `img-${idx}` }));
  } else {
    chosen = shuffle(EMOJIS).slice(0, pairNumbers).map((emoji, idx) => ({ type: 'emoji', src: emoji, id: `emoji-${idx}` }));
  }
  const deck = shuffle([...chosen, ...chosen]).map((item, idx) => ({
    id: idx,
    type: item.type,
    src: item.src,
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
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const [userImages, setUserImages] = useState([]); // array of { uri }


  // Reset game when pairNumbers changes
  useEffect(() => {
    resetGame();
  }, [pairNumbers, userImages]);

  useEffect(() => {
    let interval = null;
    if (timerActive && !won) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!timerActive || won) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, won]);

  useEffect(() => {
    if (flippedIndices.length === 2) {
      setIsBusy(true);
      const [firstIdx, secondIdx] = flippedIndices;
      if (cards[firstIdx].src === cards[secondIdx].src) { // Compare src for image cards
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
      setTimerActive(false);
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
    setCards(createShuffledDeck(pairNumbers, userImages));
    setFlippedIndices([]);
    setIsBusy(false);
    setWon(false);
    setSeconds(0);
    setTimerActive(true);
  }

  const pairsFound = cards.filter((card) => card.matched).length / 2;

  const pickImages = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need media library permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // Only available on web and iOS 14+
      quality: 1,
      selectionLimit: pairNumbers, // Limit to number of pairs
    });

    if (!result.canceled) {
      setUserImages(result.assets.map(asset => ({ uri: asset.uri })));
    }
  };

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
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>Time: {seconds} s</Text>
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
              {card.flipped || card.matched
                ? (card.type === 'emoji'
                    ? card.src
                    : <Image source={{ uri: card.src }} style={{ width: 40, height: 40 }} />)
                : '❓'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {won && (
        <View style={styles.winContainer}>
          <Text style={styles.winText}>🎉 You won! 🎉</Text>
        </View>
      )}
      <View style={styles.pairsFoundContainer}>
        <Text style={styles.pairsFoundText}>Pairs found: {pairsFound}</Text>
      </View>
      <View style={styles.resetButtonContainer}>
        <Button
          onPress={resetGame}
          title="Reset Game"
          accessibilityLabel="Reset Game"
        />
      </View>
      <View style={styles.chooseImagesButtonContainer}>
        <Button
          onPress={pickImages}
          title="Choose Images"
          accessibilityLabel="Choose Images"
        />
      </View>
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
  pairsFoundContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  pairsFoundText: {
    fontSize: 18,
    color: '#888',
  },
  resetButtonContainer: {
    marginTop: 20,
    color: '#841584',
  },
  timerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 18,
    color: '#333',
  },
  chooseImagesButtonContainer: {
    marginTop: 20,
    color: '#841584',
  },
});
