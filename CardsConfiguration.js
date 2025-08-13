import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, ScrollView, Platform } from 'react-native';
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
      
      <View style={styles.tableWrapper}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Pair number</Text>
          <Text style={styles.headerCell}>Type</Text>
          <Text style={styles.headerCell}>Content</Text>
        </View>
        
        <ScrollView 
          style={styles.tableScrollView}
          contentContainerStyle={styles.tableContentContainer}
          showsVerticalScrollIndicator={true}
        >
          {pairsConfiguration.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.cell}>{index + 1}</Text>
              <Text style={styles.cell}>{item.type}</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={item.content}
                  onValueChange={(value) => updateContent(index, value)}
                  style={styles.picker}
                  mode={Platform.OS === 'android' ? 'dropdown' : 'default'}
                >
                  {availableEmojis.map((emoji, emojiIndex) => (
                    <Picker.Item key={emojiIndex} label={emoji} value={emoji} />
                  ))}
                </Picker>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      
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
    paddingTop: Platform.OS === 'android' ? 50 : 40,
    paddingHorizontal: 20,
  },
  configTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  tableWrapper: {
    flex: 1,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  tableScrollView: {
    flex: 1,
  },
  tableContentContainer: {
    paddingBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    minHeight: 60,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
  pickerContainer: {
    flex: 1,
    minHeight: 50,
    justifyContent: 'center',
  },
  picker: {
    height: Platform.OS === 'android' ? 50 : 50,
    width: '100%',
    backgroundColor: Platform.OS === 'android' ? 'transparent' : undefined,
  },
  backButtonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
});
