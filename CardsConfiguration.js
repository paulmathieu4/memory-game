import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function CardsConfiguration({ onBack, pairsConfiguration, onUpdateConfiguration }) {
  const availableEmojis = [
    '🐶', '🐱', '🦊', '🐻', '🐼', '🐸', '🦁', '🐵', '🐯', '🐨', '🦄', '🐙',
    '🐷', '🐮', '🐷', '🐸', '🐙', '🦋', '🐞', '🐜', '🦗', '🕷️', '🦂', '🐢',
    '🐍', '🦎', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪',
    '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🐐', '🦌',
    '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩',
    '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐇', '🐿️', '🦔', '🐉', '🐲',
    '🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🎋', '🍃',
    '🍂', '🍁', '🍄', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌻', '🌼', '🌸',
    '🌼', '🌻', '🌺', '🌹', '🌷', '🌼', '🌻', '🌺', '🌹', '🌷', '🌻'
  ];

  const updateContent = (index, newContent) => {
    const updatedConfiguration = [...pairsConfiguration];
    updatedConfiguration[index].content = newContent;
    onUpdateConfiguration(updatedConfiguration);
  };

  return (
    <View style={styles.configContainer}>
      <Text style={styles.configTitle}>CARDS CONFIGURATION</Text>
      
      <ScrollView style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Pair number</Text>
          <Text style={styles.headerCell}>Type</Text>
          <Text style={styles.headerCell}>Content</Text>
        </View>
        
        {pairsConfiguration.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.cell}>{index + 1}</Text>
            <Text style={styles.cell}>{item.type}</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={item.content}
                onValueChange={(value) => updateContent(index, value)}
                style={styles.picker}
              >
                {availableEmojis.map((emoji, emojiIndex) => (
                  <Picker.Item key={emojiIndex} label={emoji} value={emoji} />
                ))}
              </Picker>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.backButtonContainer}>
        <Button
          onPress={onBack}
          title="Back to Game"
          accessibilityLabel="Back to Game"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  configContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  configTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  tableContainer: {
    width: '90%',
    maxHeight: 400,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  pickerContainer: {
    flex: 1,
    height: 50,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  backButtonContainer: {
    marginTop: 20,
  },
});
