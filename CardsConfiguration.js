import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, ScrollView, Platform, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

export default function CardsConfiguration({ onBack, pairsConfiguration, onUpdateConfiguration, initialConfiguration }) {
  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenWidth < 600; // Hide pair number column on screens smaller than 600px
  
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

  const updateType = (index, newType) => {
    const updatedConfiguration = [...pairsConfiguration];
    updatedConfiguration[index].type = newType;
    // Reset content when switching types
    if (newType === 'emoji') {
      updatedConfiguration[index].content = availableEmojis[0];
    } else if (newType === 'image') {
      updatedConfiguration[index].content = null; // Will be set when image is picked
    }
    onUpdateConfiguration(updatedConfiguration);
  };

  const pickImage = async (index) => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need media library permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const updatedConfiguration = [...pairsConfiguration];
      updatedConfiguration[index].content = imageUri;
      onUpdateConfiguration(updatedConfiguration);
    }
  };

  const movePairUp = (index) => {
    if (index > 0) {
      const updatedConfiguration = [...pairsConfiguration];
      const temp = updatedConfiguration[index];
      updatedConfiguration[index] = updatedConfiguration[index - 1];
      updatedConfiguration[index - 1] = temp;
      onUpdateConfiguration(updatedConfiguration);
    }
  };
  const movePairDown = (index) => {
    if (index < pairsConfiguration.length - 1) {
      const updatedConfiguration = [...pairsConfiguration];
      const temp = updatedConfiguration[index];
      updatedConfiguration[index] = updatedConfiguration[index + 1];
      updatedConfiguration[index + 1] = temp;
      onUpdateConfiguration(updatedConfiguration);
    }
  };

  const resetConfiguration = () => {
    onUpdateConfiguration([...initialConfiguration]);
  };

  const renderContentPicker = (item, index) => {
    if (item.type === 'emoji') {
      return (
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
      );
    } else if (item.type === 'image') {
      return (
        <View style={styles.imagePickerContainer}>
          {item.content ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: item.content }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={() => pickImage(index)}
              >
                <Text style={styles.changeImageText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.pickImageButton}
              onPress={() => pickImage(index)}
            >
              <Text style={styles.pickImageText}>Pick Image</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.configContainer}>
      <Text style={styles.configTitle}>CARDS CONFIGURATION</Text>
      
      <View style={styles.tableWrapper}>
        <View style={styles.tableHeader}>
          {!isSmallScreen && <Text style={styles.headerCell}>Pair number</Text>}
          <Text style={styles.headerCell}>Type</Text>
          <Text style={styles.headerCell}>Content</Text>
          <Text style={styles.headerCell}>Actions</Text>
        </View>
        
        <ScrollView 
          style={styles.tableScrollView}
          contentContainerStyle={styles.tableContentContainer}
          showsVerticalScrollIndicator={true}
        >
          {pairsConfiguration.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              {!isSmallScreen && <Text style={styles.cell}>{index + 1}</Text>}
              <View style={styles.typePickerContainer}>
                <Picker
                  selectedValue={item.type}
                  onValueChange={(value) => updateType(index, value)}
                  style={styles.typePicker}
                  mode={Platform.OS === 'android' ? 'dropdown' : 'default'}
                >
                  <Picker.Item label="Emoji" value="emoji" />
                  <Picker.Item label="Image" value="image" />
                </Picker>
              </View>
              {renderContentPicker(item, index)}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, index === 0 && styles.actionButtonDisabled]}
                  onPress={() => movePairUp(index)}
                  disabled={index === 0}
                >
                  <Text style={[styles.actionButtonText, index === 0 && styles.actionButtonTextDisabled]}>↑</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, index === pairsConfiguration.length - 1 && styles.actionButtonDisabled]}
                  onPress={() => movePairDown(index)}
                  disabled={index === pairsConfiguration.length - 1}
                >
                  <Text style={[styles.actionButtonText, index === pairsConfiguration.length - 1 && styles.actionButtonTextDisabled]}>↓</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.resetButtonContainer}>
        <Button
          onPress={resetConfiguration}
          title="Reset Configuration"
          accessibilityLabel="Reset Configuration"
          color="#FF3B30"
        />
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
    minHeight: 80,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
  typePickerContainer: {
    flex: 1,
    minHeight: 50,
    justifyContent: 'center',
  },
  typePicker: {
    height: Platform.OS === 'android' ? 50 : 50,
    width: '100%',
    backgroundColor: Platform.OS === 'android' ? 'transparent' : undefined,
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
  imagePickerContainer: {
    flex: 1,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickImageButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  pickImageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginBottom: 4,
  },
  changeImageButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  changeImageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  resetButtonContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  backButtonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  actionsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#ccc',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonTextDisabled: {
    color: '#999',
  },
});
